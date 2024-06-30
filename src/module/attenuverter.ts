import { ModuleRef, Patch, WiggleContext } from '../WiggleContext';

export function attenuverter(context: WiggleContext,
  {
    source,
    gain,
    offset
  }: {
    source: ModuleRef;
    gain?: Patch;
    offset?: Patch;
}): ModuleRef {
  return context.define({
    mapping: { source, gain: gain ?? 1, offset: offset ?? 0 },
    create(context) {
      const node = new AudioWorkletNode(context, 'attenuverter-processor');
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid attenuverter source`;
        } else {
          source.connect(worklet);
        }
      } else if (
        ['gain', 'offset'].indexOf(inputName) !== -1
      ) {
        // @ts-ignore
        const param = worklet.parameters.get(inputName);
        if (!param) {
          throw `Unknown param ${inputName}`;
        }
        if (typeof source === 'number') {
          param.value = source;
        } else {
          source.connect(param);
        }
      }
    }
  })
}
