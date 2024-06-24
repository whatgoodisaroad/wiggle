import { ModuleRef, WiggleContext } from '../WiggleContext';

export function noise(context: WiggleContext) {
  const id = context.getId();
  context.push({
    id,
    mapping: { },
    create(context) {
      const node = new AudioWorkletNode(context, "white-noise-processor");
      return { node };
    },
    connect() { }
  })
  return { id };
}
