type VirtualNode = {
  input: AudioNode;
  output: AudioNode;
};

export type ModuleId = number;
export type Patch = number | ModuleRef;
export type ModuleDefinition = {
  mapping: Record<string, Patch>;
  create(context: AudioContext): ({
    node: AudioNode;
    inputNode?: AudioNode;
    isSource?: boolean;
  });
  connect(inputName: string, source: AudioNode | number, destination: AudioNode);
};
export type Module = { id: ModuleId } & ModuleDefinition;
export type ModuleRef = { id: ModuleId; };

export class WiggleContext {
  _idCounter: number = 0;
  _modules: Module[] = [];
  _audioContext: AudioContext | null = null;
  _oscillators: OscillatorNode[] = [];
  _containerSelector: string;

  constructor(containerSelector: string) {
    this._containerSelector = containerSelector;
  }

  define(module: ModuleDefinition): ModuleRef {
    const id = ++this._idCounter;
    this._modules.push({ ...module, id });
    return { id };
  }

  get isPlaying(): boolean {
    return !!this._audioContext;
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

  async start(): Promise<void> {
    if (this._audioContext) {
      console.log('Already started');
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
          source = sourceNode.output;
        }
        if (source === undefined) {
          throw `Cannot complete mapping`;
        }
        module.connect(inputName, source, destinationNode.input)
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

  renderPlaybackWidget() {
    const timestamp = document.createElement('code');
    let timestampUpdatePid: any = null;
    const timestampUpdateInterval = 25;
    const updateTimestamp = () => {
      timestamp.textContent = this.timestamp;
      timestampUpdatePid = setTimeout(() => updateTimestamp(), timestampUpdateInterval);
    };
    
    const playStopButton = document.createElement('button');
    playStopButton.textContent = 'Play';
    playStopButton.addEventListener('click', (e) => {
      if (this.isPlaying) {
        this.stop();
        if (timestampUpdatePid) {
          clearTimeout(timestampUpdatePid);
          timestampUpdatePid = null;
        }
        playStopButton.textContent = 'Play';
      } else {
        this.start();
        updateTimestamp();
        playStopButton.textContent = 'Stop';
      }
    });

    const legend = document.createElement('legend');
    legend.textContent = 'Playback';

    const container = document.querySelector(this._containerSelector);
    const widget = document.createElement('fieldset');
    widget.appendChild(legend);
    widget.appendChild(playStopButton);
    widget.appendChild(document.createTextNode(' '));
    widget.appendChild(timestamp);
    container.appendChild(widget);
  }
}
