import { Module, Patch, defineModule } from '../WiggleContext';

export const comparator = defineModule('wiggle/comparator', ({
  source,
}: {
  source: Module;
}) => {
  let comparator: AudioWorkletNode | undefined;
  return {
    mapping: { source },
    create(context) {
      comparator = new AudioWorkletNode(context, "comparator-processor");
      const node = new ConstantSourceNode(context);
      comparator.port.onmessage = (message) => {
        node.offset.setValueAtTime(message.data === 'above' ? 1 : 0, context.currentTime);
      };
      return { node, inputNode: comparator, isSource: true };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid comparator source`;
        } else {
          source.connect(worklet);
        }
      }
    }
  };
});
