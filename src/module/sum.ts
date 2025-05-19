import { Module, Patch, defineModule } from '../WiggleContext';

export function sum(
  { inputs }: { inputs: Module[] }
): Module {
  const mapping: Record<string, Patch> = {};
  for (let index = 0; index < inputs.length; ++index) {
    mapping[index] = inputs[index];
  }
  return defineModule({
    namespace: 'wiggle/sum',
    mapping,
    create(context) {
      const node = context.createGain();
      node.gain.value = 1 / inputs.length;
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
  });
}
