import { defineModule } from '../WiggleContext';

export function noise() {
  return defineModule({
    namespace: 'wiggle/noise',
    mapping: { },
    create(context) {
      const node = new AudioWorkletNode(context, "white-noise-processor");
      return { node };
    },
    connect() { }
  })
}
