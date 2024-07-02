import { CHROMATIC_PICHES_IN_ORDER, Octave, PITCH_CLASS_INDEX, PitchClass } from "./chromatic";

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

export function enumerateScale({ root, mode }: Scale): number[] {
  const result: number[] = [];  
  let chromaticRootIndex = PITCH_CLASS_INDEX[root];
  let modeIndex = 0;
  let modeOffset = 0;
  while (chromaticRootIndex + modeOffset < CHROMATIC_PICHES_IN_ORDER.length) {
    result.push(CHROMATIC_PICHES_IN_ORDER[chromaticRootIndex + modeOffset]);
    modeIndex = (modeIndex + 1) % mode.length;
    if (modeIndex === 0) {
      modeOffset = 0;
      chromaticRootIndex += 12;
    } else {
      modeOffset = mode[modeIndex];
    }
  }
  return result;
}
