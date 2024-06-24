import { ModuleRef, Patch, WiggleContext } from '../WiggleContext';
import { adsr } from '../module/adsr';
import { attenuverter } from '../module/attenuverter';
import { vca } from '../module/vca';
import { vco } from '../module/vco';
import { pitch } from '../pitch';

export function fmKick(
  context: WiggleContext,
  {
    gate,
    decay = 0.5,
    pitchDecay = 0.25,
    frequency = pitch.a0,
    fmPitchFactor = 1.1,
  }: {
    gate: ModuleRef;
    decay?: number;
    pitchDecay?: number;
    frequency?: number;
    fmPitchFactor?: number;
  }
): ModuleRef {
  const pitchEnvelope = adsr(context, { attack: 0, decay: pitchDecay, gate });
  const fmPitch = attenuverter(
    context,
    { source: pitchEnvelope, offset: frequency, gain: fmPitchFactor }
  );
  const osc = vco(context, { frequency: fmPitch, shape: 'sine' });
  const levelEnvelope = adsr(context, { attack: 0.001, decay, gate });
  return vca(context, { input: osc, gain: levelEnvelope });
}
