import { playback } from "./widgets";
import * as uuid from 'uuid';

type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

type VirtualNode = {
  input: AudioNode;
  output: AudioNode;
};

export type ModuleId = string;
export type Patch = number | ModuleRef;
export type ModuleDefinition = {
  mapping?: Record<string, Patch>;
  create(context: AudioContext): ({
    node: AudioNode;
    inputNode?: AudioNode;
    isSource?: boolean;
  });
  connect?: (inputName: string, source: AudioNode | number, destination: AudioNode) => void;
};
export type Module = { id: ModuleId } & Concrete<ModuleDefinition>;
export type ModuleRef = Module;





type SignalChain = {
  outputId: ModuleId;
  links: ModuleRef[];
};

function getUpstreamModules(downstream: ModuleRef): ModuleRef[] {
  const result: ModuleRef[] = [];
  for (const patch of Object.values(downstream.mapping ?? {})) {
    if (typeof patch === 'number') {
      continue;
    }
    result.push(patch);
  }
  return result;
}

export function toSignalChain(output: ModuleRef): SignalChain {
  const upstream: Record<ModuleId, ModuleRef> = { };
  const frontier = [output]
  while (frontier.length > 0) {
    const current = frontier.shift();
    upstream[current.id] = current;
    for (const next of getUpstreamModules(current)) {
      if (next.id in upstream) {
        continue;
      }
      frontier.push(next);
    }
  }
  return {
    outputId: output.id,
    links: Object.values(upstream),
  }
}

export function reify({ outputId, links }: SignalChain): void {
  const outputModule = links.find(({ id }) => id === outputId);
  if (!outputModule) {
    throw 'Invalid signal chain';
  }
  const ctx = new WiggleContext('#container');
  for (const module of links) {
    ctx.register(module);
  }
  playback(ctx);
}

export function defineModule(module: ModuleDefinition): ModuleRef {
  return {
    id: uuid.v7(),
    mapping: {},
    connect() {},
    ...module,
  };
}

export class WiggleContext {
  _idCounter: number = 0;
  _modules: Module[] = [];
  _audioContext: AudioContext | null = null;
  _sources: OscillatorNode[] = [];
  _containerSelector: string;
  _started: boolean = false;
  _suspended: boolean = false;
  
  constructor(containerSelector: string) {
    this._containerSelector = containerSelector;
  }

  _define(module: ModuleDefinition): ModuleRef {
    const id = `${++this._idCounter}`;
    const ref: Module = {
      id,
      mapping: {},
      connect() {},
      ...module,
    };
    // this._modules.push(ref);
    return ref;
  }

  register(module: ModuleRef): void {
    this._modules.push(module);
  }

  get isBuilt(): boolean {
    return !!this._audioContext;
  }

  get isPlaying(): boolean {
    return this._started && !this._suspended;
  }

  get timestamp(): string | null {
    if (!this._audioContext) {
      return null;
    }
    const ts = this._audioContext.currentTime;
    const minutes = `${Math.floor(ts / 60)}`;
    const seconds = `${Math.floor(ts) % 60}`;
    const paddedSeconds = seconds.length === 1 ? `0${seconds}` : seconds;
    const fractional = `${ts}`.replace(/^\d+\./, '').slice(0, 4);
    const paddedFractional = `${fractional}${new Array(4 - fractional.length).fill('0').join('')}`;
    return `${minutes}:${paddedSeconds}:${paddedFractional}`;
  }

  async build(): Promise<void> {
    if (this._audioContext) {
      console.log('Already built');
      return;
    }

    const AudioContext = window.AudioContext || window['webkitAudioContext'];
    this._audioContext = new AudioContext();
    await this._audioContext.audioWorklet.addModule("../build/processors.js");
    const nodes: Record<ModuleId, VirtualNode> = { };
  
    for (const module of this._modules) {
      const { node, inputNode, isSource: isOscillator } = module.create(this._audioContext);
      nodes[module.id] = { output: node, input: inputNode ?? node };
      if (isOscillator) {
        this._sources.push(node as OscillatorNode);
      }
    }
  
    for (const module of this._modules) {
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
          source = sourceNode.output;
        }
        if (source === undefined) {
          throw `Cannot complete mapping`;
        }
        module.connect?.(inputName, source, destinationNode.input)
      }
    }
  }

  start() {
    if (!this._audioContext) {
      console.log('Not built');
      return;
    }
    if (this._suspended) {
      this._audioContext.resume();
      this._suspended = false;
    } else {
      for (const source of this._sources) {
        source.start();
      }
      this._started = true;
    }
  }

  stop() {
    if (!this._started) {
      console.log('Not started');
      return;
    }
    this._suspended = true;
    this._audioContext.suspend();
  }

  dispose() {
    for (const source of this._sources) {
      source.stop();
    }
    this._audioContext.close();
    this._audioContext = null;
    this._modules = [];
    this._sources = [];
  }

  renderWidget(element: HTMLElement) {
    document.querySelector(this._containerSelector).appendChild(element);
  }
}
