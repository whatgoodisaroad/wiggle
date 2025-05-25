import * as uuid from 'uuid';
import { BASE_MODULES } from './registry';

type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

type VirtualNode = {
  input: AudioNode;
  output: AudioNode;
};

export type ModuleId = string;
export type Patch = number | Module;
export type Mapping = Record<string, Patch>;
export type Namespace = string;
export type ModuleDefinition = {
  mapping?: Mapping;
  create(context: AudioContext): ({
    node: AudioNode;
    inputNode?: AudioNode;
    isSource?: boolean;
  });
  connect?: (inputName: string, source: AudioNode | number, destination: AudioNode) => void;
  render?: () => HTMLElement | null;
};
export type Module = Concrete<ModuleDefinition> & {
  id: ModuleId;
  namespace: Namespace;
  params: any;
}
export type StaticMapping = Record<string, number | ModuleId>;
export type StaticNode = {
  id: ModuleId;
  params: any;
  namespace: Namespace;
};
export type StaticSignalChain = {
  outputId: ModuleId;
  links: StaticNode[];
};
type BaseModuleDefinition<T> = ((t: T) => Module) & { namespace: Namespace };

function getUpstreamModules(downstream: Module): Module[] {
  const result: Module[] = [];
  for (const patch of Object.values(downstream.mapping ?? {})) {
    if (typeof patch === 'number') {
      continue;
    }
    result.push(patch);
  }
  return result;
}

export function toStaticSignalChain({
  output,
  additional = [],
}: {
  output: Module;
  additional?: Module[];
}): StaticSignalChain {
  const upstream = new Map<ModuleId, StaticNode>();
  const frontier = [output, ...additional];
  while (frontier.length > 0) {
    const current = frontier.shift();
    
    const mapping: StaticMapping = {};
    for (const [inputName, patch] of Object.entries(current.mapping ?? {})) {
      mapping[inputName] = typeof patch === 'number' ? patch : patch.id;
    }
    
    upstream.set(current.id, {
      id: current.id,
      namespace: current.namespace,
      params: current.params,
    });
    for (const next of getUpstreamModules(current)) {
      if (upstream.has(next.id)) {
        continue;
      }
      frontier.push(next);
    }
  }
  return {
    outputId: output.id,
    links: [...upstream.values()],
  }
}

export function reifyStatic({ outputId, links }: StaticSignalChain): void {
  const outputModule = links.find(({ id }) => id === outputId);
  if (!outputModule) {
    throw 'Invalid signal chain';
  }
  const ctx = new WiggleContext('#container');
  for (const { id, params, namespace } of links) {
    const moduleConstructor = BASE_MODULES.get(namespace);
    if (!moduleConstructor) {
      throw `Unknown module ${namespace}`;
    }
    const module = moduleConstructor(params);
    module.id = id;
    ctx.register(module);

    const widget = module.render();
    if (widget) {
      ctx.renderWidget(widget);
    }
  }
  playback(ctx);
}

export function defineModule<T>(
  namespace: Namespace,
  f: (t: T) => ModuleDefinition
): BaseModuleDefinition<T> {
  let g = (t: T) => ({
    id: uuid.v7(),
    mapping: {},
    connect() {},
    render() { return null; },
    ...f(t),
    namespace,
    params: t,
  }) as Module;
  g['namespace'] = namespace;
  return g as BaseModuleDefinition<T>;
}

class WiggleContext {
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

  register(module: Module): void {
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
    await this._audioContext.audioWorklet.addModule("/processors.js");
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

function playback(context: WiggleContext): void {
  const timestamp = document.createElement('code');
  let timestampUpdatePid: any = null;
  const timestampUpdateInterval = 25;
  const updateTimestamp = () => {
    timestamp.textContent = context.timestamp;
    timestampUpdatePid = setTimeout(() => updateTimestamp(), timestampUpdateInterval);
  };
  
  const playStopButton = document.createElement('button');
  playStopButton.textContent = 'Play';
  playStopButton.addEventListener('click', async (e) => {
    if (context.isPlaying) {
      context.stop();
      if (timestampUpdatePid) {
        clearTimeout(timestampUpdatePid);
        timestampUpdatePid = null;
      }
      playStopButton.textContent = 'Play';
    } else {
      if (!context.isBuilt) {
        await context.build();
      }
      context.start();
      updateTimestamp();
      playStopButton.textContent = 'Pause';
    }
  });

  const legend = document.createElement('legend');
  legend.textContent = 'Playback';

  const widget = document.createElement('fieldset');
  widget.appendChild(legend);
  widget.appendChild(playStopButton);
  widget.appendChild(document.createTextNode(' '));
  widget.appendChild(timestamp);

  context.renderWidget(widget);
}
