import { Module, defineModule } from '../WiggleContext';

export const gate = defineModule(({
  source,
}: {
  source: Module;
}) => ({
  namespace: 'wiggle/gate',
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
  },
}));
