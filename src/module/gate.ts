import { ModuleRef, WiggleContext } from '../WiggleContext';

export function gate(context: WiggleContext, { source }: { source: ModuleRef }) {
  const id = context.getId();
  context.push({
    id,
    mapping: { source },
    create(context) {
      const node = new AudioWorkletNode(context, "gate-processor");
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid gate source`;
        } else {
          source.connect(worklet);
        }
      }
    }
  })
  return { id };
}
