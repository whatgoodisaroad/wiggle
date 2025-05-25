import { defineModule } from '../WiggleContext';

export const noise = defineModule('wiggle/noise', ({}: {}) => ({
  create(context) {
    const node = new AudioWorkletNode(context, "white-noise-processor");
    return { node };
  },
  connect() { }
}));
