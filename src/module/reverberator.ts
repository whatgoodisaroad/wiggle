import { ModuleRef, defineModule } from '../WiggleContext';
import SimpleReverb from 'soundbank-reverb';

export function reverberator(
  { source }: { source: ModuleRef }
): ModuleRef {
  return defineModule({
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
  });
}
