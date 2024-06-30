import { ModuleRef, Patch, WiggleContext } from '../WiggleContext';

export function vco(
  context: WiggleContext,
  { frequency, shape }: { frequency: Patch; shape: OscillatorType }
): ModuleRef {
  return context.define({
    mapping: { frequency },
    create(context) {
      const node = context.createOscillator();
      node.type = shape as OscillatorType;
      node.frequency.value = 0;
      return { node, isOscillator: true };
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
