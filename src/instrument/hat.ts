import { ModuleRef, WiggleContext } from '../WiggleContext';
import { adsr } from '../module/adsr';
import { noise } from '../module/noise';
import { vca } from '../module/vca';
import { vcf } from '../module/vcf';
import { pitch } from '../pitch';

export function hat(
  context: WiggleContext,
  { gate, decay = 0.05 }: { gate: ModuleRef; decay?: number }
): ModuleRef {
  return vcf(context, {
    source: vca(context, {
      input: noise(context),
      gain: adsr(context, { attack: 0.005, decay, gate }),
    }),
    cutoff: pitch.a1,
    type: 'notch',
    resonance: 0.001,
  });
}
