export type ModuleId = number;
export type Patch = number | ModuleRef;
export type ModuleDefinition = {
  mapping: Record<string, Patch>;
  create(context: AudioContext): ({ node: AudioNode; isOscillator?: boolean });
  connect(inputName: string, source: AudioNode | number, destination: AudioNode);
};
export type Module = { id: ModuleId } & ModuleDefinition;
export type ModuleRef = { id: ModuleId; };

export class WiggleContext {
  _idCounter: number = 0;
  _modules: Module[] = [];
  _audioContext: AudioContext | null = null;
  _oscillators: OscillatorNode[] = [];

  define(module: ModuleDefinition): ModuleRef {
    const id = ++this._idCounter;
    this._modules.push({ ...module, id });
    return { id };
  }

  async start(): Promise<void> {
    if (this._audioContext) {
      console.log('Already started');
      return;
    }

    const AudioContext = window.AudioContext || window['webkitAudioContext'];
    this._audioContext = new AudioContext();
    await this._audioContext.audioWorklet.addModule("../build/processors.js");
    const nodes = { }; // new Map<ModuleId, AudioNode>();
  
    for (const module of this._modules) {
      const { node, isOscillator } = module.create(this._audioContext);
      nodes[module.id] = node;
      if (isOscillator) {
        this._oscillators.push(node as OscillatorNode);
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
          source = sourceNode;
        }
        if (source === undefined) {
          throw `Cannot complete mapping`;
        }
        module.connect(inputName, source, destinationNode)
      }
    }
  
    for (const osc of this._oscillators) {
      osc.start();
    }
  }

  stop() {
    this._modules = [];
    while (this._oscillators.length > 0) {
      const osc = this._oscillators.shift();
      osc.stop();
    }
    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }
  }
}
