import { ModuleRef, WiggleContext } from '../WiggleContext';

export function gateSequencer(
  context: WiggleContext,
  { sequence, trigger }: { sequence: boolean[]; trigger: ModuleRef }
) {
  return context.define({
    mapping: { trigger },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        "trigger-sequencer-processor",
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
  });
}
