import { reify, toSignalChain } from './WiggleContext';
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
  distortion,
  vcf,
  octave,
  sampleAndHold,
  attenuverter,
} from './module';
import { sequentialSwitch, drumSequencer } from './sequencer';
import { MAJOR, chords } from './scale/modes';
import { scope, toggle, slider } from './widgets';
import { keyboard } from './widgets/keyboard';

const master = clock({ beatsPerMinute: 120 });

const drumsLevel = toggle({ label: 'Drums', initialState: true });
const melodyLevel = slider({
  label: 'Melody Level',
  minimum: 0,
  maximum: 1,
  initialValue: 0.75,
});
const bassLevel = slider({
  label: 'Bass Level',
  minimum: 0,
  maximum: 1,
  initialValue: 0.75,
});

const {
  gates: [kickGate, hatGate, snareGate, melodyGroove, bassGroove],
  velocities: [kickVelocity, hatVelocity]
} = drumSequencer({
  channels: [
    '.   .   .   .   .   .   .   . 7 ',
    ' .5   5.',
    '    .   ',
    '.. . ',
    '. . ... . ',
  ],
  clockX2: master.eighth,
});
const drums = vca({
  input: sum({
    inputs: [
      vca({
        input: fmKick({
          gate: kickGate,
        }),
        gain: kickVelocity,
      }),
      vca({
        input: hat({
          gate: hatGate,
        }),
        gain: hatVelocity,
      }),
      snare({
        gate: snareGate,
      }),
    ]
  }),
  gain: drumsLevel,
});

const { I, V, vi, IV } = chords({ root: 'c', mode: MAJOR }, 3);
const sequence = [I, V, vi, IV, vi, V, vi, IV];
const freqSequences = [0, 1, 2].map((i) => sequentialSwitch({ 
  trigger: clockDivider({ trigger: master.beat, division: 4 }),
  sequence: sequence.map((fs) => fs[i]),
}));
const melody = vca({
  gain: melodyLevel,
  input: reverberator({
    source: vca({ 
      gain: adsr({
        gate: melodyGroove,
        attack: 0.1,
        decay: 0.5,
      }),
      input: sum({
        inputs: freqSequences.map(
          (frequency) => vco({ frequency, shape: 'triangle' }),
        ),
      }),
    }),
  }),
});

const basslineIndexSequence = [0, 0, 2, 1];
const bassline = octave({
  octaves: -1,
  source: sequentialSwitch({
    trigger: master.beat,
    sequence: sequence.map(
      (chord, index) =>
        chord[basslineIndexSequence[index % basslineIndexSequence.length]]
    )
  })
});

const bass = vca({
  gain: bassLevel,
  input: vca({
    gain: adsr({
      gate: bassGroove,
      attack: 0,
      decay: 1,
    }),
    input: vcf({
      type: 'lowpass',
      cutoff: 300,
      resonance: 2,
      source: distortion({
        source: vco({
          frequency: sampleAndHold({
            source: bassline,
            trigger: bassGroove,
          }),
          shape: 'square',
        }),
        amount: 700,
      }),
    }),
  }),
});

const { gate, pitch } = keyboard({ label: 'Lead' });
const lead = vca({
  input: vcf({
    source: vca({
      input: vco({
        frequency: sum({
          inputs: [
            pitch,
            vca({
              input: vca({
                input: vco({
                  frequency: 8,
                  shape: 'sine',
                }),
                gain: adsr({
                  gate,
                  attack: 2,
                  decay: 0.01,
                  sustain: 1,
                  release: 0.01,
                }),
              }),
              gain: 25,
            }),
          ],
        }),
        shape: 'square',
      }),
      gain: adsr({
        gate,
        attack: 0,
        decay: 0.1,
        sustain: 0.8,
        release: 4,
      }),
    }),
    type: 'lowpass',
    cutoff: attenuverter({
      source: adsr({
        gate,
        attack: 0,
        decay: 0.2,
      }),
      offset: 100,
      gain: 600,
    }),
    resonance: 10,
  }),
  gain: 0.2,
});

const mix = sum({ inputs: [drums, melody, bass, lead] });
const s = scope({ source: mix });
const o = output({ source: mix });

reify(toSignalChain({ output: o, additional: [s] }))
