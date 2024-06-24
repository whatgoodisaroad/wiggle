export type ModuleId = number;
export type Patch = number | ModuleRef;
export type Module = {
  id: ModuleId,
  mapping: Record<string, Patch>;
  create(context: AudioContext): ({ node: AudioNode; isOscillator?: boolean });
  connect(inputName: string, source: AudioNode | number, destination: AudioNode);
};
export type ModuleRef = { id: ModuleId; };

export class WiggleContext {
  _idCounter: number = 0;
  _modules: Module[] = [];
  _audioContext: AudioContext | null = null;
    
  getId(): number {
    return ++this._idCounter;
  }

  push(module: Module): void {
    this._modules.push(module);
  }

  async reify(): Promise<{ cancel(): void }> {
    const AudioContext = window.AudioContext || window['webkitAudioContext'];
    this._audioContext = new AudioContext();
    await this._audioContext.audioWorklet.addModule("../build/processors.js");
    const oscillators: OscillatorNode[] = [];
    const nodes = { }; // new Map<ModuleId, AudioNode>();
  
    for (const module of this._modules) {
      const { node, isOscillator } = module.create(this._audioContext);
      nodes[module.id] = node;
      if (isOscillator) {
        oscillators.push(node as OscillatorNode);
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
  
    for (const osc of oscillators) {
      osc.start();
    }
  
    return {
      cancel() {
        for (const osc of oscillators) {
          osc.stop();
        }
        this._audioContext.close();
      }
    }
  }
}
