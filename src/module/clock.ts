import { Module } from '../WiggleContext';
import { vco } from '../module/vco';
import { clockDivider } from './clockDivider';

export function clock(
  { beatsPerMinute }: { beatsPerMinute: number }
): {
  beat: Module;
  half: Module;
  quarter: Module;
  eighth: Module;
  sixteenth: Module;
  thirtySecond: Module;
} {
  const thirtySecond = vco({
    frequency: 32 * beatsPerMinute / 60,
    shape: 'square',
  });
  return {
    thirtySecond,
    sixteenth:  clockDivider({ trigger: thirtySecond, division: 2 }),
    eighth:     clockDivider({ trigger: thirtySecond, division: 4 }),
    quarter:    clockDivider({ trigger: thirtySecond, division: 8 }),
    half:       clockDivider({ trigger: thirtySecond, division: 16 }),
    beat:       clockDivider({ trigger: thirtySecond, division: 32 }),
  };
};
