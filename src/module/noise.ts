import { ModuleRef, WiggleContext } from '../WiggleContext';

export function noise(context: WiggleContext) {
  return context.define({
    mapping: { },
    create(context) {
      const node = new AudioWorkletNode(context, "white-noise-processor");
      return { node };
    },
    connect() { }
  })
}
