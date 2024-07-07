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

class ComparatorProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._threshold = 0;
    this._above = false;
  }

  process(inputs) {
    const input = inputs[0];
    for (let channelIndex = 0; channelIndex < input.length; ++channelIndex) {
      for (
        let sampleIndex = 0;
        sampleIndex < input[channelIndex].length;
        ++sampleIndex
      ) {
        const newAbove = input[channelIndex][sampleIndex] > this._threshold;
        if (newAbove && !this._above) {
          this.port.postMessage('above');
        } else if (!newAbove && this._above) {
          this.port.postMessage('below');
        }
        this._above = newAbove;
      }
    }
    return true;
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
  constructor(options) {
    super(options);
    this._index = 0;
  }

  process(inputs) {
    this._index++;
    console.log(inputs[0][0][0]);
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
registerProcessor("comparator-processor", ComparatorProcessor);
registerProcessor("gate-processor", GateProcessor);
registerProcessor("control-sequencer-processor", ControlSequencerProcessor);
registerProcessor('logging-processor', LoggingProcessor);
registerProcessor("trigger-sequencer-processor", TriggerSequencerProcessor);
registerProcessor("attenuverter-processor", AttenuverterProcessor);
registerProcessor("quantizer-processor", QuantizerProcessor);
registerProcessor("sample-and-hold-processor", SampleAndHoldProcessor);
