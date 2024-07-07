import { ModuleRef, WiggleContext } from '../WiggleContext';
import { sequentialSwitch } from './sequentialSwitch';

export function gateSequencer(
  context: WiggleContext,
  {
    sequence,
    trigger,
  }: {
    sequence: boolean[];
    trigger: ModuleRef;
  }
) {
  return sequentialSwitch(context, {
    trigger,
    sequence: sequence.map((gate) => gate ? 1 : 0)
  });
}
