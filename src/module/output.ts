import { ModuleRef, WiggleContext } from '../WiggleContext';

export function output(context: WiggleContext, { source }: { source: ModuleRef }) {
  const id = context.getId();
  context.push({
    id,
    mapping: { source },
    create(context) {
      const node = new GainNode(context);
      node.gain.value = 1;
      node.connect(context.destination);
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid VCA source`;
        } else {
          source.connect(vca);
        }
      }
    }
  })
  return { id };
}
  