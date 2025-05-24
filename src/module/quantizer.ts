import { Module, defineModule } from '../WiggleContext';

export const quantizer = defineModule(({
  source,
  quanta,
}: {
  source: Module;
  quanta: number[];
}) => ({
  namespace: 'wiggle/quantizer',
    mapping: { source },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        'quantizer-processor',
        { processorOptions: { quanta } }
      );
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid quantizer source`;
        } else {
          source.connect(worklet);
        }
      }
    }
}));
