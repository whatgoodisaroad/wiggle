import { WiggleContext } from './WiggleContext';
import { fmKick } from './instrument/fmKick';
import { snare } from './instrument/snare';
import { hat } from './instrument/hat';
import { adsr } from './module/adsr';
import { gateSequencer } from './sequencer/gateSequencer';
import { output } from './module/output';
import { sequentialSwitch } from './sequencer/sequentialSwitch';
import { vca } from './module/vca';
import { vcf } from './module/vcf';
import { vco } from './module/vco';
import { pitch } from './pitch';
import { clock } from './module/clock';
import { drumSequencer } from './sequencer/drumSequencer';

const ctx = new WiggleContext();

async function newStart() {  
  const master = clock(ctx, { beatsPerMinute: 120 });

  const groove = gateSequencer(ctx, {
    trigger: master.eighth,
    sequence: [false, false, false, false, true, false, true, false],
  });
  const melody = sequentialSwitch(ctx, { 
    trigger: groove,
    sequence: [pitch.g1, pitch.a2, pitch.c1]
  });
  const envelope = adsr(ctx, { gate: groove, decay: 0.2 });
  const osc = vco(ctx, { frequency: melody, shape: 'square' });
  const level = vca(ctx, { input: osc, gain: envelope });
  const filter = vcf(ctx, {
    source: level,
    type: 'lowpass',
    cutoff: 1_000,
    resonance: 20,
  });
  output(ctx, { source: filter, gain: 0.05 });

  const {
    gates: [kickGate, hatGate, snareGate],
    velocities: [kickVelocity, hatVelocity]
  } = drumSequencer(ctx, {
    channels: [
      '.   .   .   .   .   .   .   . 7 ',
      ' .5   5.',
      '    .   ',
    ],
    clockX2: master.eighth,
  });

  output(ctx, {
    source: vca(ctx, {
      input: fmKick(ctx, {
        gate: kickGate,
      }),
      gain: kickVelocity,
    }),
    gain: 0.5,
  });

  output(ctx, {
    source: vca(ctx, {
      input: hat(ctx, {
        gate: hatGate,
      }),
      gain: hatVelocity,
    }),
    gain: 0.4,
  });

  output(ctx, {
    source: snare(ctx, {
      gate: snareGate,
    }),
    gain: 0.5,
  });

  ctx.start();
}

document.querySelector('#startButton').addEventListener('click', newStart);
document.querySelector('#stopButton').addEventListener('click', () => ctx.stop());
