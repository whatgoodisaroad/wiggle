import { Module } from '../WiggleContext';
import { gateSequencer } from '../sequencer/gateSequencer';

export function clockDivider(
  { trigger, division }: { trigger: Module; division: 2 | 4 | 8 | 16 | 32 }
): Module {
  const sequence = [true];
  for (let i = 0; i < division - 1; ++i) {
    sequence.push(false);
  }
  return gateSequencer({ sequence, trigger });  
}
