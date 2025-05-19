import { Module } from '../WiggleContext';
import { adsr } from '../module/adsr';
import { attenuverter } from '../module/attenuverter';
import { distortion } from '../module/distortion';
import { noise } from '../module/noise';
import { sum } from '../module/sum';
import { vca } from '../module/vca';
import { vcf } from '../module/vcf';
import { vco } from '../module/vco';
import { PITCH } from '../scale/chromatic';

export function snare(
  { gate }: { gate: Module }
): Module {
  const [fundamental, partial1, partial2, partial3] = [
    vco({ frequency: 203, shape: 'sine' }),
    vco({ frequency: 456, shape: 'sine' }),
    vco({ frequency: 597, shape: 'sine' }),
    vco({ frequency: 920, shape: 'sine' }),
  ];

  return distortion({
    amount: 200,
    source: vcf({
      type: 'lowshelf',
      cutoff: 1_000,
      resonance: 1,
      source: sum({
        inputs: [
          // Fundamental:
          vca({
            input: fundamental,
            gain: adsr({
              gate,
              attack: 0.001,
              decay: 0.15,
            }),
          }),
          // Overtones:
          vca({
            input: sum({
              inputs: [partial1, partial2, partial3],
            }),
            gain: 
            attenuverter({
              source: adsr({
                gate,
                attack: 0.001,
                decay: 0.1,
              }),
              gain: 0.2,
            }),
          }),
          // Snares:
          attenuverter({
            source: vcf({
              source: vca({
                input: noise(),
                gain: adsr({
                  attack: 0.01,
                  decay: 0.1,
                  gate,
                }),
              }),
              cutoff: PITCH.a5,
              type: 'bandpass',
              resonance: 0.05,
            }),
            gain: 0.5,
          }),
          // Click:
          attenuverter({
            source: vca({
              input: noise(),
              gain: adsr({
                attack: 0.01,
                decay: 0.05,
                gate,
              }),
            }),
            gain: 0.7,
          }),
        ],
      })
    })
  });
}
