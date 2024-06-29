import { ModuleRef, Patch, WiggleContext } from './WiggleContext';
import { fmKick } from './instrument/fmKick';
import { hat } from './instrument/hat';
import { adsr } from './module/adsr';
import { attenuverter } from './module/attenuverter';
import { clockDivider } from './module/clockDivider';
import { gate } from './module/gate';
import { gateSequencer } from './module/gateSequencer';
import { output } from './module/output';
import { sequentialSwitch } from './module/sequentialSwitch';
import { vca } from './module/vca';
import { vcf } from './module/vcf';
import { vco } from './module/vco';
import { pitch } from './pitch';

const ctx = new WiggleContext();

async function newStart() {  
  const clockLfo = vco(ctx, { frequency: 16, shape: 'square' });
  const clock = gate(ctx, { source: clockLfo });
  const groove = gateSequencer(ctx, {
    trigger: clock, 
    sequence: [false, false, false, false, true, false, true, false],
  });

  const melody = sequentialSwitch(ctx, { 
    trigger: groove,
    sequence: [pitch.g1, pitch.a2, pitch.g1]
  });
  const envelope = adsr(ctx, { gate: groove, decay: 0.2 });
  const osc = vco(ctx, { frequency: melody, shape: 'square' });
  const level = vca(ctx, { input: osc, gain: envelope });
  const filterLfo = attenuverter(ctx, {
    source: vco(ctx, { frequency: 0.77, shape: 'sine' }),
    gain: 500,
    offset: pitch.a5,
  });
  const filter = vcf(ctx, {
    source: level,
    type: 'lowpass',
    cutoff: filterLfo,
    resonance: 20,
  });
  // output(ctx, { source: filter, gain: 0.05 });

  output(ctx, {
    source: fmKick(ctx, {
      gate: clockDivider(ctx, { trigger: clock, division: 8 }),
    }),
  });

  output(ctx, {
    source: hat(ctx, {
      gate: gateSequencer(ctx, {
        sequence: [false, true],
        trigger: clockDivider(ctx, { trigger: clock, division: 4 }),
      }),
    }),
    gain: 0.5,
  });

  ctx.start();
}

document.querySelector('#startButton').addEventListener('click', newStart);
document.querySelector('#stopButton').addEventListener('click', () => ctx.stop());
