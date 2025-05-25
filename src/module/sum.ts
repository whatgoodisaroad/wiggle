import { Module, Patch, defineModule } from '../WiggleContext';

export const sum = defineModule('wiggle/sum', (inputs: Module[]) => {
  const mapping: Record<number, Patch> = {};
  for (let index = 0; index < inputs.length; ++index) {
    mapping[index] = inputs[index];
  }
  return {
    namespace: 'wiggle/sum',
    mapping,
    create(context) {
      const node = context.createGain();
      node.gain.value = 1 / Object.keys(inputs).length;
      return { node };
    },
    connect(inputName, source, dest) {
      const gain = dest as GainNode;
      if (typeof source === 'number') {
        throw 'Cannot sum a constant'
      } else {
        source.connect(gain);
      }
    },
  }
});
