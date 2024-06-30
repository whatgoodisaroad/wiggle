import { ModuleRef, WiggleContext } from '../WiggleContext';

export function sequentialSwitch(
  context: WiggleContext,
  { sequence, trigger }: { sequence: number[]; trigger: ModuleRef }
) {
  const id = context.getId();
  context.push({
    id,
    mapping: { trigger },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        "control-sequencer-processor",
        { processorOptions: { sequence } }
      );
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'trigger') {
        if (typeof source === 'number') {
          throw `Invalid sequencer trigger`;
        } else {
          source.connect(worklet);
        }
      }
    }
  })
  return { id };
}
