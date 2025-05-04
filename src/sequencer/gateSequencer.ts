import { ModuleRef } from '../WiggleContext';
import { sequentialSwitch } from './sequentialSwitch';

export function gateSequencer(
  {
    sequence,
    trigger,
  }: {
    sequence: boolean[];
    trigger: ModuleRef;
  }
) {
  return sequentialSwitch({
    trigger,
    sequence: sequence.map((gate) => gate ? 1 : 0)
  });
}
