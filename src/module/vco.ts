import { Module, Patch, defineModule } from '../WiggleContext';

export function vco(
  { frequency, shape }: { frequency: Patch; shape: OscillatorType }
): Module {
  return defineModule({
    namespace: 'wiggle/vco',
    mapping: { frequency },
    create(context) {
      const node = context.createOscillator();
      node.type = shape as OscillatorType;
      node.frequency.value = 0;
      return { node, isSource: true };
    },
    connect(inputName, source, dest) {
      const osc = dest as OscillatorNode;
      if (inputName === 'frequency') {
        if (typeof source === 'number') {
          osc.frequency.value = source;
        } else {
          source.connect(osc.frequency);
        }
      }
    },
  });
}
