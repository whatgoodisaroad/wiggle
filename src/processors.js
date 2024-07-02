/* global currentTime */
/* global sampleRate */

// https://developer.chrome.com/blog/audio-worklet
// https://googlechromelabs.github.io/web-audio-samples/audio-worklet/

class WhiteNoiseProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      output.forEach((channel) => {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = Math.random() * 2 - 1;
        }
      });
      return true;
    }
}

class AdsrProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this._triggeredAtByChannel = new Map();
    this._isSustainingByChannel = new Map();
    this._releasedAtByChannel = new Map();
  }

  static get parameterDescriptors() {
    return [
      { name: 'attack', defaultValue: 0 },
      { name: 'decay', defaultValue: 0 },
      { name: 'sustain', defaultValue: 1 },
      { name: 'release', defaultValue: 0 }
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      const inputChannel = input[channelIndex];
      const outputChannel = output[channelIndex];
      let triggeredAt = this._triggeredAtByChannel.get(channelIndex) ?? -1;
      let isSustaining = this._isSustainingByChannel.get(channelIndex) ?? false;
      let releasedAt = isSustaining ? -1 : this._releasedAtByChannel.get(channelIndex) ?? -1;

      for (let sampleIndex = 0; sampleIndex < inputChannel.length; ++sampleIndex) {
        const now = currentTime + sampleIndex / sampleRate;
        const sample = inputChannel[sampleIndex];
        
        // Is this the beginning of a new sustain?
        if (!isSustaining && sample > 0) {
          triggeredAt = now;
          this._triggeredAtByChannel.set(channelIndex, triggeredAt);
          releasedAt = -1;
          this._releasedAtByChannel.set(channelIndex, releasedAt);
        }

        // Or is this the end of a sustain?
        if (isSustaining && sample <= 0) {
          releasedAt = now;
          this._releasedAtByChannel.set(channelIndex, releasedAt);
        }

        isSustaining = sample > 0;
        
        outputChannel[sampleIndex] = this.getLevel(
          triggeredAt,
          releasedAt,
          now,
          // TODO: check for constants
          parameters.attack[0],
          parameters.decay[0],
          parameters.sustain[0],
          parameters.release[0]
        );
      }

      this._isSustainingByChannel.set(channelIndex, isSustaining);
    }
    return true;
  }

  getLevel(
    triggeredAt,
    releasedAt,
    currentTime,
    attackTime,
    decayTime,
    sustainLevel,
    releaseTime
  ) {
    // Zero if there has been no trigger;
    if (triggeredAt < 0) {
      return 0;
    }
    let phaseElapsed = currentTime - triggeredAt;

    // Attack phase
    if (attackTime > 0 && phaseElapsed < attackTime) {
      return phaseElapsed / attackTime;
    }
    
    // Decay phase
    phaseElapsed -= attackTime;
    if (decayTime > 0 && phaseElapsed < decayTime) {
      return (1 - (phaseElapsed / decayTime)) * (1 - sustainLevel) + sustainLevel;
    }

    // Sustain phase
    if (releasedAt === -1) {
      return sustainLevel;
    }

    // Release phase
    if (releasedAt > 0 && releaseTime > 0) {
      const releaseElapsed = currentTime - releasedAt;
      if (releaseElapsed < releaseTime) {
        return (1 - (releaseElapsed / releaseTime)) * sustainLevel;
      }
    }

    return 0;
  }
}

class GateProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        output[channelIndex][sampleIndex] =
          input[channelIndex][sampleIndex] > 0 ? 1 : 0;  
      }
    }
    return true;
  }
}

class ControlSequencerProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._step = 0;
    this._sequence = options.processorOptions.sequence;
    this._inputHigh = false;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        const newInputHigh = input[channelIndex][sampleIndex] > 0;
        if (!this._inputHigh && newInputHigh) {
          this._step = (this._step + 1) % this._sequence.length;
        }
        this._inputHigh = newInputHigh;
        output[channelIndex][sampleIndex] = this._sequence[this._step];
      }
    }
    return true;
  }
}

class TriggerSequencerProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._step = 0;
    this._sequence = options.processorOptions.sequence;
    this._inputHigh = false;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        const newInputHigh = input[channelIndex][sampleIndex] > 0;
        if (!this._inputHigh && newInputHigh) {
          this._step = (this._step + 1) % this._sequence.length;
        }
        this._inputHigh = newInputHigh;
        output[channelIndex][sampleIndex] =
          this._sequence[this._step] ? 1 : 0;
      }
    }
    return true;
  }
}

class LoggingProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const inputChannel = inputs[0][0];
    for (
      let sampleIndex = 0;
      sampleIndex < inputChannel.length;
      ++sampleIndex
    ) {
      console.log(inputChannel[sampleIndex]);
    }
    return true;
  }
}

class AttenuverterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'gain', defaultValue: 1 },
      { name: 'offset', defaultValue: 0 },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        output[channelIndex][sampleIndex] =
          input[channelIndex][sampleIndex] * parameters.gain[0] +
          parameters.offset[0];
      }
    }
    return true;
  }
}

class QuantizerProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._quanta = options.processorOptions.quanta ?? [];
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        output[channelIndex][sampleIndex] =
          this.snap(input[channelIndex][sampleIndex], this._quanta);
      }
    }
    return true;
  }

  snap(value, quanta) {
    if (quanta[0] > value) {
      return quanta[0];
    }

    for (let index = 0; index < quanta.length - 1; ++index) {
      const quantum = quanta[index];
      const nextQuantum = quanta[index + 1];
      if (quantum <= value && nextQuantum > value) {
        return value - quantum < nextQuantum - value ? quantum : nextQuantum;
      }
    }
    return quanta[quanta.length - 1];
  }
}

class SampleAndHoldProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'trigger', defaultValue: 0 },
    ];
  }

  constructor(options) {
    super(options);
    this._sample = 0;
    this._inputHigh = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        this._inputHigh = parameters.trigger[sampleIndex] > 0;
        if (this._inputHigh) {
          this._sample = input[channelIndex][sampleIndex];
        }
        output[channelIndex][sampleIndex] = this._sample;
      }
    }
    return true;
  }
}


registerProcessor("white-noise-processor", WhiteNoiseProcessor);
registerProcessor("adsr-processor", AdsrProcessor);
registerProcessor("gate-processor", GateProcessor);
registerProcessor("control-sequencer-processor", ControlSequencerProcessor);
registerProcessor('logging-processor', LoggingProcessor);
registerProcessor("trigger-sequencer-processor", TriggerSequencerProcessor);
registerProcessor("attenuverter-processor", AttenuverterProcessor);
registerProcessor("quantizer-processor", QuantizerProcessor);
registerProcessor("sample-and-hold-processor", SampleAndHoldProcessor);
