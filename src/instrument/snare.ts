import { ModuleRef, WiggleContext } from '../WiggleContext';
import { adsr } from '../module/adsr';
import { attenuverter } from '../module/attenuverter';
import { noise } from '../module/noise';
import { sum } from '../module/sum';
import { vca } from '../module/vca';
import { vcf } from '../module/vcf';
import { vco } from '../module/vco';
import { pitch } from '../pitch';

export function snare(
  context: WiggleContext,
  { gate }: { gate: ModuleRef }
): ModuleRef {
  const [fundamental, partial1, partial2, partial3] = [
    vco(context, { frequency: 203, shape: 'sine' }),
    vco(context, { frequency: 456, shape: 'sine' }),
    vco(context, { frequency: 597, shape: 'sine' }),
    vco(context, { frequency: 920, shape: 'sine' }),
  ];
  return vcf(context, {
    type: 'lowshelf',
    cutoff: 1_000,
    resonance: 1,
    source: sum(context, {
      inputs: [
        // Fundamental:
        vca(context, {
          input: fundamental,
          gain: adsr(context, {
            gate,
            attack: 0.001,
            decay: 0.15,
          }),
        }),
        // Overtones:
        vca(context, {
          input: sum(context, {
            inputs: [partial1, partial2, partial3],
          }),
          gain: 
          attenuverter(context, {
            source: adsr(context, {
              gate,
              attack: 0.001,
              decay: 0.1,
            }),
            gain: 0.2,
          }),
        }),
        // Snares:
        attenuverter(context, {
          source: vcf(context, {
            source: vca(context, {
              input: noise(context),
              gain: adsr(context, {
                attack: 0.01,
                decay: 0.1,
                gate,
              }),
            }),
            cutoff: pitch.a5,
            type: 'bandpass',
            resonance: 0.05,
          }),
          gain: 0.5,
        }),
        // Click:
        attenuverter(context, {
          source: vca(context, {
            input: noise(context),
            gain: adsr(context, {
              attack: 0.01,
              decay: 0.05,
              gate,
            }),
          }),
          gain: 0.7,
        }),
      ],
    })
  });
}
