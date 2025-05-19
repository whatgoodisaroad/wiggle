import { Module } from '../WiggleContext';
import { adsr } from '../module/adsr';
import { noise } from '../module/noise';
import { vca } from '../module/vca';
import { vcf } from '../module/vcf';
import { PITCH } from '../scale/chromatic';

export function hat(
  { gate, decay = 0.05 }: { gate: Module; decay?: number }
): Module {
  return vcf({
    source: vca({
      input: noise(),
      gain: adsr({ attack: 0.005, decay, gate }),
    }),
    cutoff: PITCH.a1,
    type: 'notch',
    resonance: 0.001,
  });
}
