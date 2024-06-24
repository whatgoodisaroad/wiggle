import { ModuleRef, Patch, WiggleContext } from '../WiggleContext';

export function vca(
  context: WiggleContext,
  { input, gain }: { input: ModuleRef, gain: Patch }
) {
  const id = context.getId();
  context.push({
    id,
    mapping: { input, gain },
    create(context) {
      const node = new GainNode(context);
      node.gain.value = 0;
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'input') {
        if (typeof source === 'number') {
          throw `Invalid VCA source`;
        }
        source.connect(vca);
      } else if (inputName === 'gain') {
        if (typeof source === 'number') {
          vca.gain.value = source;
        } else {
          source.connect(vca.gain);
        }
      }
    }
  })
  return { id };
}
