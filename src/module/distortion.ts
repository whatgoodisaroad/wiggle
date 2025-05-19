import { Module, defineModule } from '../WiggleContext';

export function distortion(
  { source, amount = 400 }: { source: Module, amount?: number }
): Module {
  return defineModule({
    namespace: 'wiggle/distortion',
    mapping: { source },
    create(context) {
      const node = new WaveShaperNode(context)
      node.curve = makeDistortionCurve(amount);
      node.oversample = '4x';
      return { node };
    },
    connect(inputName, source, dest) {
      const node = dest as WaveShaperNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid distortion source`;
        } else {
          source.connect(node);
        }
      }
    },
  });
}

// From https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper
function makeDistortionCurve(amount?: number): Float32Array {
  const k = typeof amount === "number" ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
