import { ModuleRef, WiggleContext } from '../WiggleContext';
import { vco } from '../module/vco';
import { clockDivider } from './clockDivider';

export function clock(
  context: WiggleContext,
  { beatsPerMinute }: { beatsPerMinute: number }
): {
  beat: ModuleRef;
  half: ModuleRef;
  quarter: ModuleRef;
  eighth: ModuleRef;
  sixteenth: ModuleRef;
  thirtySecond: ModuleRef;
} {
  const thirtySecond = vco(context, {
    frequency: 32 * beatsPerMinute / 60,
    shape: 'square',
  });
  return {
    thirtySecond,
    sixteenth:  clockDivider(context, { trigger: thirtySecond, division: 2 }),
    eighth:     clockDivider(context, { trigger: thirtySecond, division: 4 }),
    quarter:    clockDivider(context, { trigger: thirtySecond, division: 8 }),
    half:       clockDivider(context, { trigger: thirtySecond, division: 16 }),
    beat:       clockDivider(context, { trigger: thirtySecond, division: 32 }),
  };
};
