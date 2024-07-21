import { ModuleRef, WiggleContext } from '../WiggleContext';

export function octave(context: WiggleContext, {
  source,
  octaves = 0,
}: {
  source: ModuleRef;
  octaves?: number;
}) {
  octaves = Math.floor(octaves);
  const factor = Math.pow(2, octaves);
  return context.define({
    mapping: { source },
    create(context) {
      const node = new GainNode(context);
      node.gain.value = factor;
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid octave source`;
        } else {
          source.connect(worklet);
        }
      }
    }
  })
}
