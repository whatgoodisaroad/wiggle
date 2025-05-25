import { Module, defineModule } from '../WiggleContext';

export const quantizer = defineModule('wiggle/quantizer', ({
  source,
  quanta,
}: {
  source: Module;
  quanta: number[];
}) => ({
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
