import { ModuleRef, WiggleContext } from '../WiggleContext';
import SimpleReverb from 'soundbank-reverb';

export function reverberator(
  context: WiggleContext,
  { source }: { source: ModuleRef }
): ModuleRef {
  const id = context.getId();
  context.push({
    id,
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
  return { id };
}
