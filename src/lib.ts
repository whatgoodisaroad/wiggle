const pitch = {
  c1: 32.7,
  d1b: 34.65,
  d1: 36.71,
  e1b: 38.89,
  e1: 41.2,
  f1: 43.65,
  g1b: 46.25,
  g1: 49,
  a1b: 51.91,
  a1: 55,
  b1b: 58.27,
  b1: 61.74,
  c2: 65.41,
  d2b: 69.3,
  d2: 73.42,
  e2b: 77.78,
  e2: 82.41,
  f2: 87.31,
  g2b: 92.5,
  g2: 98,
  a2b: 103.83,
  a2: 110,
  b2b: 116.54,
  b2: 123.47,
  c3: 130.81,
  d3b: 138.59,
  d3: 146.83,
  e3b: 155.56,
  e3: 164.81,
  f3: 174.61,
  g3b: 185,
  g3: 196,
  a3b: 207.65,
  a3: 220,
  b3b: 233.08,
  b3: 246.94,
  c4: 261.63,
  d4b: 277.18,
  d4: 293.66,
  e4b: 311.13,
  e4: 329.63,
  f4: 349.23,
  g4b: 369.99,
  g4: 392,
  a4b: 415.3,
  a4: 440,
  b4b: 466.16,
  b4: 493.88,
  c5: 523.25,
  d5b: 554.37,
  d5: 587.33,
  e5b: 622.25,
  e5: 659.26,
  f5: 698.46,
  g5b: 739.99,
  g5: 783.99,
  a5b: 830.61,
  a5: 880,
  b5b: 932.33,
  b5: 987.77,
};

let oscillators: OscillatorNode[] = [];

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
  const id = idCounter++;
  context.push({
    id,
    mapping: { frequency },
    create(context) {
      const node = context.createOscillator();
      node.type = shape as OscillatorType;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
  const id = idCounter++;
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
          throw `Invalid VCA source`;
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
  
  const clockLfo = vco(ctx, { frequency: 8, shape: 'square' });
  const clock = gate(ctx, { source: clockLfo });
  const groove = gateSequencer(ctx, {
    trigger: clock,
    sequence: [true, false],
  });
  const melody = sequentialSwitch(ctx, { 
    trigger: groove,
    sequence: [pitch.a3, pitch.c3, pitch.f3] 
  });
  const envelope = adsr(ctx, { gate: groove, decay: 0.4 });
  const osc = vco(ctx, { frequency: melody, shape: 'square' });
  const level = vca(ctx, { input: osc, gain: envelope });
  const filterLfo = vca(ctx, {
    input: vco(ctx, { frequency: 3, shape: 'sine' }),
    gain: 1000,
  });
  const filter = vcf(ctx, {
    source: level,
    type: 'lowpass',
    cutoff: filterLfo,
    resonance: 1,
  });
  output(ctx, { source: filter });

  execute(ctx).then((r) => cancel = r.cancel);
}

function stopAll(): void {
  cancel();
}
