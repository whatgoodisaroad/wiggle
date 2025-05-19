import { Module, defineModule } from '../WiggleContext';

export function output(
  { source, gain = 1 }: { source: Module; gain?: number }
) {
  return defineModule({
    namespace: 'wiggle/output',
    mapping: { source },
    create(context) {
      const node = new GainNode(context);
      node.gain.value = gain;
      node.connect(context.destination);
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid gain source`;
        } else {
          source.connect(vca);
        }
      }
    }
  });
}
