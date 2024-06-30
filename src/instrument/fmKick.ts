import { ModuleRef, WiggleContext } from '../WiggleContext';
import { adsr } from '../module/adsr';
import { attenuverter } from '../module/attenuverter';
import { noise } from '../module/noise';
import { sum } from '../module/sum';
import { vca } from '../module/vca';
import { vcf } from '../module/vcf';
import { vco } from '../module/vco';
import { PITCH } from '../scale/chromatic';

export function fmKick(
  context: WiggleContext,
  {
    gate,
    decay = 0.25,
    pitchDecay = 0.15,
    frequency = PITCH.a0,
    fmPitchFactor = 1.1,
    cutoff,
  }: {
    gate: ModuleRef;
    decay?: number;
    pitchDecay?: number;
    frequency?: number;
    fmPitchFactor?: number;
    cutoff?: number;
  }
): ModuleRef {
  const body = vcf(context, {
    type: 'lowpass',
    cutoff: cutoff ?? (frequency * 8),
    resonance: 5,
    source: vca(context, {
      input: vco(context, {
        frequency: attenuverter(
          context, {
            source: adsr(context, {
              attack: 0.05,
              decay: pitchDecay,
              gate,
            }),
            offset: frequency,
            gain: fmPitchFactor,
          }
        ),
        shape: 'sine',
      }),
      gain: adsr(context, {
        attack: 0.001,
        decay,
        gate,
      }),
    })
  });
  const transient = attenuverter(context, {
    source: vcf(context, {
      source: vca(context, {
        input: noise(context),
        gain: adsr(context, {
          attack: 0.001,
          decay: 0.01,
          gate,
        }),
      }),
      cutoff: PITCH.a5,
      type: 'bandpass',
      resonance: 0.01,
    }),
    gain: 0.05,
  });
  return sum(context, { inputs: [body, transient] });
}
