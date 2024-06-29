import { ModuleRef, WiggleContext } from '../WiggleContext';
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
  return vca(context, {
    input: vco(context, {
      frequency: attenuverter(
        context, {
          source: adsr(context, {
            attack: 0,
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
  });
}
