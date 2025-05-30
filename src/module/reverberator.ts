import { Module, defineModule } from '../WiggleContext';
import SimpleReverb from 'soundbank-reverb';

export const reverberator = defineModule('wiggle/reverberator', ({
  source,
}: {
  source: Module;
}) => ({
  mapping: { source },
  create(context) {
    const node: AudioNode = new SimpleReverb(context);
    return { node };
  },
  connect(inputName, source, dest) {
    const reverb = dest as SimpleReverb;
    if (inputName === 'source') {
      if (typeof source === 'number') {
        throw `Invalid reverb source`;
      } else {
        source.connect(reverb);
      }
    }
  },
}));
