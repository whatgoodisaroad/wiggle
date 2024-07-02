import { ModuleRef, WiggleContext } from '../WiggleContext';

export function sampleAndHold(
  context: WiggleContext,
  { source, trigger }: { source: ModuleRef; trigger: ModuleRef }
) {
  return context.define({
    mapping: { source, trigger },
    create(context) {
      const node = new AudioWorkletNode(context, "sample-and-hold-processor");
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid s&h source`;
        } else {
          source.connect(worklet);
        }
      } else if (inputName === 'trigger') {
        // @ts-ignore
        const param = worklet.parameters.get('trigger');
        if (!param) {
          throw `Unknown param trigger`;
        }
        if (typeof source === 'number') {
          throw `Invalid s&h trigger`;
        } else {
          source.connect(param);
        }
      }
    }
  });
}
