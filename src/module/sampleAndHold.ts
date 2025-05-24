import { Module, defineModule } from '../WiggleContext';

export const sampleAndHold = defineModule(({
  source,
  trigger,
}: {
  source: Module;
  trigger: Module;
}) => {
  let comparator: AudioWorkletNode | undefined;
  return {
    namespace: 'wiggle/sample-and-hold',
    mapping: { source, trigger },
    create(context) {
      const sampler = new AudioWorkletNode(context, "sample-processor");
      comparator = new AudioWorkletNode(context, "comparator-processor");

      const node = new ConstantSourceNode(context);
      comparator.port.onmessage = (message) => {
        if (message.data === 'above') {
          sampler.port.postMessage(null);
        }
      };

      sampler.port.onmessage = (message) => {
        node.offset.setValueAtTime(message.data, context.currentTime);
      };
      
      return { node, inputNode: sampler, isSource: true };
    },
    connect(inputName, source, dest) {
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid s&h source`;
        } else {
          source.connect(dest);
        }
      } else if (inputName === 'trigger') {
        if (typeof source === 'number') {
          throw `Invalid s&h trigger`;
        } else if (!comparator) {
          throw 'Comparator failed to initialize';
        } else {
          source.connect(comparator);
        }
      }
    }
  };
});
