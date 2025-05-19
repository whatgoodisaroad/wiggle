import { Module, defineModule } from '../WiggleContext';

export function gate({ source }: { source: Module }) {
  return defineModule({
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
    }
  })
}
