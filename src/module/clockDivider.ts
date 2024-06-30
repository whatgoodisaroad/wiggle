import { ModuleRef, WiggleContext } from '../WiggleContext';
import { gateSequencer } from '../sequencer/gateSequencer';

export function clockDivider(
  context: WiggleContext,
  { trigger, division }: { trigger: ModuleRef; division: 2 | 4 | 8 | 16 | 32 }
): ModuleRef {
  const sequence = [true];
  for (let i = 0; i < division - 1; ++i) {
    sequence.push(false);
  }
  return gateSequencer(context, { sequence, trigger });  
}
