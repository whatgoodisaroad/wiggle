import { WiggleContext } from './WiggleContext';
import { fmKick, snare, hat } from './instrument';
import {
  adsr,
  output,
  vca,
  vco,
  clock,
  reverberator,
  sum,
  clockDivider,
} from './module';
import { sequentialSwitch, drumSequencer } from './sequencer';
import { MAJOR, chords } from './scale/modes';
import { playback, scope, toggle, slider } from './widgets';

const ctx = new WiggleContext('#container');
const master = clock(ctx, { beatsPerMinute: 120 });

const drumsLevel = toggle(ctx, { label: 'Drums', initialState: true });
const melodyLevel = slider(ctx, {
  label: 'Melody Level',
  minimum: 0,
  maximum: 1,
  initialValue: 0.75,
});

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
const drums = vca(ctx, {
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
});

const { I, V, vi, IV } = chords({ root: 'c', mode: MAJOR }, 3);
const sequence = [I, V, vi, IV, vi, V, vi, IV];
const freqSequences = [0, 1, 2].map((i) => sequentialSwitch(ctx, { 
  trigger: clockDivider(ctx, { trigger: master.beat, division: 4 }),
  sequence: sequence.map((fs) => fs[i]),
}));
const melody = vca(ctx, {
  gain: melodyLevel,
  input: reverberator(ctx, {
    source: vca(ctx, { 
      gain: adsr(ctx, {
        gate: drumSequencer(ctx, {
          channels: ['.. . '],
          clockX2: master.eighth,
        }).gates[0],
        attack: 0.1,
        decay: 0.5,
      }),
      input: sum(ctx, {
        inputs: freqSequences.map(
          (frequency) => vco(ctx, { frequency, shape: 'triangle' }),
        ),
      }),
    }),
  }),
});

const mix = sum(ctx, { inputs: [drums, melody] });
output(ctx, { source: mix });
scope(ctx, { source: mix });
playback(ctx);
