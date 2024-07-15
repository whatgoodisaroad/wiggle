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
import { PITCH } from './scale/chromatic';
import { clock } from './module/clock';
import { drumSequencer } from './sequencer/drumSequencer';
import { reverberator } from './module/reverberator';
import { quantizer } from './module/quantizer';
import { attenuverter } from './module/attenuverter';
import { MAJOR, enumerateScale } from './scale/modes';
import { noise } from './module/noise';
import { sampleAndHold } from './module/sampleAndHold';
import { playback } from './widgets/playback';
import { scope } from './widgets/scope';
import { toggle } from './widgets/toggle';
import { sum } from './module/sum';
import { slider } from './widgets/slider';

const ctx = new WiggleContext('#container');
const master = clock(ctx, { beatsPerMinute: 120 });

const drumsLevel = toggle(ctx, { label: 'Drums', initialState: false });
const arpGain = slider(ctx, {
  label: 'Arp Level',
  minimum: 0,
  maximum: 1,
  initialValue: 0.75,
});
const bassLevel = slider(ctx, {
  label: 'Bass Level',
  minimum: 0,
  maximum: 1,
  initialValue: 0.75,
});

const groove = gateSequencer(ctx, {
  trigger: master.eighth,
  sequence: [false, false, false, false, true, false, true, false],
});
const melody = sequentialSwitch(ctx, { 
  trigger: groove,
  sequence: [PITCH.g1, PITCH.a2, PITCH.c1]
});
const envelope = adsr(ctx, { gate: groove, decay: 0.4 });
const osc = vco(ctx, { frequency: melody, shape: 'square' });
const level = vca(ctx, { input: osc, gain: envelope });
const filter = vcf(ctx, {
  source: level,
  type: 'lowpass',
  cutoff: 1_000,
  resonance: 20,
});
const reverb = reverberator(ctx, { source: filter });
output(ctx, { source: vca(ctx, { input: reverb, gain: bassLevel }), gain: 0.1 });
scope(ctx, { source: reverb });

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
    input: sum(ctx, {
      inputs: [
        vca(ctx, {
          input: fmKick(ctx, {
            gate: kickGate,
          }),
          gain: kickVelocity,
        }),
        vca(ctx, {
          input: hat(ctx, {
            gate: hatGate,
          }),
          gain: hatVelocity,
        }),
        snare(ctx, {
          gate: snareGate,
        }),
      ]
    }),
    gain: drumsLevel,
  })
});

const quantizedPitch = quantizer(ctx, {
  source: sampleAndHold(ctx, {
    source: attenuverter(ctx, {
      source: noise(ctx),
      offset: PITCH.c4,
      gain: 100,
    }),
    trigger: master.quarter,
  }),
  quanta: enumerateScale({ root: 'e', mode: MAJOR }),
});
output(ctx, {
  source: vca(ctx, {
    input: vca(ctx, {
      input: vco(ctx, {
        frequency: quantizedPitch,
        shape: 'sawtooth',
      }),
      gain: adsr(ctx, {
        decay: 0.4,
        gate: master.quarter,
      })
    }),
    gain: arpGain,
  }),
  gain: 0.1,
});

playback(ctx);
