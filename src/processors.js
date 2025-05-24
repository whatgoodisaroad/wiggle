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

class LoggingProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._index = 0;
    this._sampleDenominator = options.processorOptions.sampleDenominator ?? 1;
  }

  process(inputs) {
    this._index++;
    if (
      this._index % this._sampleDenominator === 0 &&
      inputs?.[0]?.[0]?.length > 0
    ) {
      this.port.postMessage({
        sample: inputs[0][0][0],
        timestamp: currentTime,
      });
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

class SampleProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._value = 0;
    this.port.onmessage = (e) => {
      this.port.postMessage(this._value);
    };
  }

  process(inputs) {
    for (
      let sampleIndex = 0;
      sampleIndex < inputs[0][0]?.length ?? 0;
      ++sampleIndex
    ) {
      this._value = inputs[0][0][sampleIndex];
    }
    return true;
  }
}

registerProcessor("white-noise-processor", WhiteNoiseProcessor);
registerProcessor("comparator-processor", ComparatorProcessor);
registerProcessor("gate-processor", GateProcessor);
registerProcessor('logging-processor', LoggingProcessor);
registerProcessor("attenuverter-processor", AttenuverterProcessor);
registerProcessor("quantizer-processor", QuantizerProcessor);
registerProcessor("sample-processor", SampleProcessor);
