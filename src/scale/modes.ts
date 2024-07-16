import { ChromaticPitch, PitchClass, CHROMATIC_PITCHES } from "./chromatic";

export type ModeIntervals = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11)[];

export type Scale = { root: PitchClass; mode: ModeIntervals };

// From https://en.wikipedia.org/wiki/List_of_musical_scales_and_modes
export const DORIAN: ModeIntervals            = [0, 2, 3, 5, 7, 9, 10];
export const LYDIAN: ModeIntervals            = [0, 2, 4, 6, 7, 9, 11];
export const LOCRIAN: ModeIntervals           = [0, 1, 3, 5, 6, 8, 10];
export const LYDIAN_DIMINISHED: ModeIntervals = [0, 2, 3, 6, 7, 9, 11];
export const MAJOR: ModeIntervals             = [0, 2, 4, 5, 7, 9, 11];
export const MAJOR_PENTATONIC: ModeIntervals  = [0, 2, 4, 7, 9];
export const MIXOLYDIAN: ModeIntervals        = [0, 2, 4, 5, 7, 9, 10];
export const MINOR_PENTATONIC: ModeIntervals  = [0, 3, 5, 7, 10];
export const NATURAL_MINOR: ModeIntervals     = [0, 2, 3, 5, 7, 8, 10];
export const PHRYGIAN: ModeIntervals          = [0, 1, 3, 5, 7, 8, 10];

export function enumerateScale({ root, mode }: Scale): ChromaticPitch[] {
  const firstIndex = CHROMATIC_PITCHES.findIndex(
    ({ pitchClass }) => pitchClass === root
  );
  const result: ChromaticPitch[] = [];
  for (
    let octaveIndex = firstIndex - 12;
    octaveIndex < CHROMATIC_PITCHES.length;
    octaveIndex += 12
  ) {
    for (const modeIndex of mode) {
      const pitchIndex = octaveIndex + modeIndex;
      if (pitchIndex < 0) {
        continue;
      }
      if (pitchIndex > CHROMATIC_PITCHES.length) {
        break;
      }
      result.push(CHROMATIC_PITCHES[pitchIndex]);
    }
  }
  return result;
}

export function enumerateScalePitches({ root, mode }: Scale): number[] {
  return enumerateScale({ root, mode }).map(({ frequency }) => frequency);
}

export function chords({ root, mode }: Scale, chordOctave: number): {
  I: number[];
  ii: number[];
  iii: number[];
  IV: number[];
  V: number[];
  vi: number[];
  viidim: number[];
  I7: number[];
  ii7: number[];
  iii7: number[];
  IV7: number[];
  V7: number[];
  vi7: number[];
  viidim7: number[];
} {
  const allPitches = enumerateScale({ root, mode });
  const startIndex = allPitches.findIndex(
    ({ pitchClass, octave }) => pitchClass === root && octave == chordOctave
  );
  const range = allPitches
    .slice(startIndex, startIndex + 2 * mode.length)
    .map(({ frequency }) => frequency);

  const result = {
    I7: [range[0], range[2], range[4], range[6]],
    ii7: [range[1], range[3], range[5], range[7]],
    iii7: [range[2], range[4], range[6], range[8]],
    IV7: [range[3], range[5], range[7], range[9]],
    V7: [range[4], range[6], range[8], range[10]],
    vi7: [range[5], range[7], range[9], range[11]],
    viidim7: [range[6], range[8], range[10], range[12]],
  };

  return {
    ...result,
    I: result.I7.slice(0, 3),
    ii: result.ii7.slice(0, 3),
    iii: result.iii7.slice(0, 3),
    IV: result.IV7.slice(0, 3),
    V: result.V7.slice(0, 3),
    vi: result.vi7.slice(0, 3),
    viidim: result.viidim7.slice(0, 3),
  }
}
