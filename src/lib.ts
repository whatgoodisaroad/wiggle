import { WiggleContext } from './WiggleContext';
import { fmKick } from './instrument/fmKick';
import { snare } from './instrument/snare';
import { hat } from './instrument/hat';
import { adsr } from './module/adsr';
import { attenuverter } from './module/attenuverter';
import { clockDivider } from './module/clockDivider';
import { gateSequencer } from './module/gateSequencer';
import { output } from './module/output';
import { sequentialSwitch } from './module/sequentialSwitch';
import { vca } from './module/vca';
import { vcf } from './module/vcf';
import { vco } from './module/vco';
import { pitch } from './pitch';
import { clock } from './module/clock';

const ctx = new WiggleContext();

async function newStart() {  
  const master = clock(ctx, { beatsPerMinute: 120 });

  const clockLfo = master.eighth;
  const groove = gateSequencer(ctx, {
    trigger: clockLfo,
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
  output(ctx, { source: filter, gain: 0.05 });

  output(ctx, {
    source: fmKick(ctx, {
      gate: clockDivider(ctx, { trigger: clockLfo, division: 8 }),
    }),
  });

  output(ctx, {
    source: hat(ctx, {
      gate: gateSequencer(ctx, {
        sequence: [false, true],
        trigger: clockDivider(ctx, { trigger: clockLfo, division: 4 }),
      }),
    }),
    gain: 0.5,
  });

  output(ctx, {
    source: snare(ctx, {
      gate: clockDivider(ctx, { trigger: clockLfo, division: 16 }),
    }),
  });

  ctx.start();
}

document.querySelector('#startButton').addEventListener('click', newStart);
document.querySelector('#stopButton').addEventListener('click', () => ctx.stop());
