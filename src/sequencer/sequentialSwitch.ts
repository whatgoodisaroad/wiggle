import { Module, defineModule } from '../WiggleContext';

export const sequentialSwitch = defineModule('wiggle/sequencer/sequential-switch', ({
  sequence,
  trigger
}: {
  sequence: number[];
  trigger: Module;
}) => {
  let index = 0;
  return {
    mapping: { trigger },
    create(context) {
      const comparator = new AudioWorkletNode(context, "comparator-processor");
      const node = new ConstantSourceNode(context);
      node.offset.value = 0;

      comparator.port.onmessage = (message) => {
        if (message.data === 'below') {
          return;
        }
        index = (index + 1) % sequence.length;
        node.offset.setValueAtTime(sequence[index], context.currentTime);
      };

      return { node, inputNode: comparator, isSource: true };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'trigger') {
        if (typeof source === 'number') {
          throw `Invalid sequencer trigger`;
        } else {
          source.connect(worklet);
        }
      }
    },
  };
});
