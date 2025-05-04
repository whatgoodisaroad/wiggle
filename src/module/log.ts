import { ModuleRef, defineModule } from '../WiggleContext';

export function log({ source }: { source: ModuleRef }) {
  return defineModule({
    mapping: { source },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        'logging-processor',
        { processorOptions: { sampleDenominator: 100 } }
      );
      node.port.onmessage = (message) => {
        console.log(message.data.sample);
      };
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid log source`;
        } else {
          source.connect(vca);
        }
      }
    }
  })
}
