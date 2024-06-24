import { pitch } from './pitch';

let idCounter = 0;

type ModuleId = number;
type Patch = number | ModuleRef;
type Module = {
  id: ModuleId,
  mapping: Record<string, Patch>;
  create(context: AudioContext): ({ node: AudioNode; isOscillator?: boolean });
  connect(inputName: string, source: AudioNode | number, destination: AudioNode);
};

type ModuleRef = {
  id: ModuleId;
}

function vco(
  context: Module[],
  { frequency, shape }: { frequency: Patch; shape: OscillatorType }
): ModuleRef {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { frequency },
    create(context) {
      const node = context.createOscillator();
      node.type = shape as OscillatorType;
      node.frequency.value = 0;
      return { node, isOscillator: true };
    },
    connect(inputName, source, dest) {
      const osc = dest as OscillatorNode;
      if (inputName === 'frequency') {
        if (typeof source === 'number') {
          osc.frequency.value = source;
        } else {
          source.connect(osc.frequency);
        }
      }
    },
  });
  return { id };
}

function adsr(
  context: Module[],
  { attack, decay, sustain, release, gate }: {
    attack?: Patch,
    decay?: Patch,
    sustain?: Patch,
    release?: Patch,
    gate: ModuleRef,
  }
) {
  const id = ++idCounter;
  context.push({
    id,
    mapping: {
      attack: attack ?? 0,
      decay: decay ?? 0,
      sustain: sustain ?? 0,
      release: release ?? 0,
      gate,
    },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        "adsr-processor",
        { parameterData: { attack: 0, decay: 0, sustain: 0, release: 0 } }
      );
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'gate') {
        if (typeof source === 'number') {
          throw `Invalid ADSR gate`;
        }
        source.connect(worklet);
      } else if (
        ['attack', 'decay', 'sustain', 'release'].indexOf(inputName) !== -1
      ) {
        // @ts-ignore
        const param = worklet.parameters.get(inputName);
        if (!param) {
          throw `Unknown param ${inputName}`;
        }
        if (typeof source === 'number') {
          param.value = source;
        } else {
          source.connect(param);
        }
      }
    }
  });
  return { id };
}

function vca(
  context: Module[],
  { input, gain }: { input: ModuleRef, gain: Patch }
) {
  const id = ++idCounter
  context.push({
    id,
    mapping: { input, gain },
    create(context) {
      const node = new GainNode(context);
      node.gain.value = 0;
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'input') {
        if (typeof source === 'number') {
          throw `Invalid VCA source`;
        }
        source.connect(vca);
      } else if (inputName === 'gain') {
        if (typeof source === 'number') {
          vca.gain.value = source;
        } else {
          source.connect(vca.gain);
        }
      }
    }
  })
  return { id };
}

function sequentialSwitch(
  context: Module[],
  { sequence, trigger }: { sequence: number[]; trigger: ModuleRef }
) {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { trigger },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        "control-sequencer-processor",
        { processorOptions: { sequence } }
      );
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'trigger') {
        if (typeof source === 'number') {
          throw `Invalid sequencer trigger`;
        } else {
          source.connect(worklet);
        }
      }
    }
  })
  return { id };
}

function gateSequencer(
  context: Module[],
  { sequence, trigger }: { sequence: boolean[]; trigger: ModuleRef }
) {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { trigger },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        "trigger-sequencer-processor",
        { processorOptions: { sequence } }
      );
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'trigger') {
        if (typeof source === 'number') {
          throw `Invalid sequencer trigger`;
        } else {
          source.connect(worklet);
        }
      }
    }
  })
  return { id };
}

function gate(context: Module[], { source }: { source: ModuleRef }) {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { source },
    create(context) {
      const node = new AudioWorkletNode(context, "gate-processor");
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid gate source`;
        } else {
          source.connect(worklet);
        }
      }
    }
  })
  return { id };
}

function trigger(context: Module[], { gate }: { gate: ModuleRef }) {
  return adsr(context, { gate: gate, decay: 0.1 });
}

function log(context: Module[], { source }: { source: ModuleRef }) {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { source },
    create(context) {
      const node = new AudioWorkletNode(context, "logging-processor");
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid log source`;
        } else {
          source.connect(vca);
        }
      }
    }
  })
  return { id };
}

function output(context: Module[], { source }: { source: ModuleRef }) {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { source },
    create(context) {
      const node = new GainNode(context);
      node.gain.value = 1;
      node.connect(context.destination);
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid VCA source`;
        } else {
          source.connect(vca);
        }
      }
    }
  })
  return { id };
}

function vcf(
  context: Module[],
  {
    source,
    type,
    cutoff,
    resonance,
  }: {
    source: ModuleRef;
    type: BiquadFilterType;
    cutoff: Patch,
    resonance: Patch,
}): ModuleRef {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { source, cutoff, resonance },
    create(context) {
      const node = new BiquadFilterNode(context, { type });
      node.gain.value = 1;
      return { node };
    },
    connect(inputName, source, dest) {
      const vcf = dest as BiquadFilterNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid VCF source`;
        } else {
          source.connect(vcf);
        }
      } else if (inputName === 'cutoff') {
        if (typeof source === 'number') {
          vcf.frequency.value = source;
        } else {
          source.connect(vcf.frequency);
        }
      } else if (inputName === 'resonance') {
        if (typeof source === 'number') {
          vcf.Q.value = source;
        } else {
          source.connect(vcf.Q);
        }
      }
    }
  })
  return { id };
}

function attenuverter(context: Module[],
  {
    source,
    gain,
    offset
  }: {
    source: ModuleRef;
    gain?: Patch;
    offset?: Patch;
}): ModuleRef {
  const id = ++idCounter;
  context.push({
    id,
    mapping: { source, gain: gain ?? 1, offset: offset ?? 0 },
    create(context) {
      const node = new AudioWorkletNode(context, 'attenuverter-processor');
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid attenuverter source`;
        } else {
          source.connect(worklet);
        }
      } else if (
        ['gain', 'offset'].indexOf(inputName) !== -1
      ) {
        // @ts-ignore
        const param = worklet.parameters.get(inputName);
        if (!param) {
          throw `Unknown param ${inputName}`;
        }
        if (typeof source === 'number') {
          param.value = source;
        } else {
          source.connect(param);
        }
      }
    }
  })
  return { id };
}

async function execute(modules: Module[]) {
  const AudioContext = window.AudioContext || window['webkitAudioContext'];
  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule("../build/processors.js");
  const oscillators: OscillatorNode[] = [];
  const nodes = { }; // new Map<ModuleId, AudioNode>();

  for (const module of modules) {
    const { node, isOscillator } = module.create(audioContext);
    nodes[module.id] = node;
    if (isOscillator) {
      oscillators.push(node as OscillatorNode);
    }
  }

  for (const module of modules) {
    const destinationNode = nodes[module.id];
    if (!destinationNode) {
      throw `Unknown mapping destination node ${module.id}`;
    }
    for (const inputName of Object.keys(module.mapping)) {
      const mapping = module.mapping[inputName];
      let source: number | AudioNode | undefined;
      if (typeof mapping === 'number') {
        source = mapping;
      } else {
        const sourceNode = nodes[mapping.id];
        if (!sourceNode) {
          throw `Cannot find mapping source node ${mapping.id}`;
        }
        source = sourceNode;
      }
      if (source === undefined) {
        throw `Cannot complete mapping`;
      }
      module.connect(inputName, source, destinationNode)
    }
  }

  for (const osc of oscillators) {
    osc.start();
  }

  return {
    cancel() {
      for (const osc of oscillators) {
        osc.stop();
      }
      audioContext.close();
    }
  }
}

let cancel = () => {};

async function newStart() {
  cancel();

  const ctx: Module[] = [];
  
  const clockLfo = vco(ctx, { frequency: 16, shape: 'square' });
  const clock = gate(ctx, { source: clockLfo });
  const groove = gateSequencer(ctx, {
    trigger: clock,
    sequence: [true, false],
  });
  const melody = sequentialSwitch(ctx, { 
    trigger: groove,
    sequence: [pitch.g1, pitch.a1, pitch.g1]
  });
  const envelope = adsr(ctx, { gate: groove, decay: 0.2 });
  const osc = vco(ctx, { frequency: melody, shape: 'square' });
  const level = vca(ctx, { input: osc, gain: envelope });
  const filterLfo = attenuverter(ctx, {
    source: vco(ctx, { frequency: 0.77, shape: 'sine' }),
    gain: 500,
    offset: pitch.a5,
  });
  const filter = vcf(ctx, {
    source: level,
    type: 'lowpass',
    cutoff: filterLfo,
    resonance: 20,
  });
  output(ctx, { source: filter });

  execute(ctx).then((r) => cancel = r.cancel);
}

function stopAll(): void {
  cancel();
}

document.querySelector('#startButton').addEventListener('click', newStart);
document.querySelector('#stopButton').addEventListener('click', stopAll);