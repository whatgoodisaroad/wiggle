import { ModuleRef, Patch, WiggleContext } from '../WiggleContext';

export function quantizer(
  context: WiggleContext,
  {
    source,
    quanta,
  }: {
    source: ModuleRef;
    quanta: number[];
}): ModuleRef {
  return context.define({
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
  });
}
