import { Module } from '../WiggleContext';
import { sequentialSwitch } from './sequentialSwitch';

export function gateSequencer(
  {
    sequence,
    trigger,
  }: {
    sequence: boolean[];
    trigger: Module;
  }
) {
  return sequentialSwitch({
    trigger,
    sequence: sequence.map((gate) => gate ? 1 : 0)
  });
}
