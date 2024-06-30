export type PitchClass =
  | 'c'
  | 'db'
  | 'd'
  | 'eb'
  | 'e'
  | 'f'
  | 'gb'
  | 'g'
  | 'ab'
  | 'a'
  | 'bb'
  | 'b';

export const PITCH_CLASS_INDEX: Record<PitchClass, number> = {
  c: 0,
  db: 1,
  d: 2,
  eb: 3,
  e: 4,
  f: 5,
  gb: 6,
  g: 7,
  ab: 8,
  a: 9,
  bb: 10,
  b: 11,
};

export const PITCH = {
  c0: 16.35,
  d0b: 17.32,
  d0: 18.35,
  e0b: 19.45,
  e0: 20.6,
  f0: 21.83,
  g0b: 23.12,
  g0: 24.5,
  a0b: 25.96,
  a0: 27.5,
  b0b: 29.14,
  b0: 30.87,
  c1: 32.7,
  d1b: 34.65,
  d1: 36.71,
  e1b: 38.89,
  e1: 41.2,
  f1: 43.65,
  g1b: 46.25,
  g1: 49,
  a1b: 51.91,
  a1: 55,
  b1b: 58.27,
  b1: 61.74,
  c2: 65.41,
  d2b: 69.3,
  d2: 73.42,
  e2b: 77.78,
  e2: 82.41,
  f2: 87.31,
  g2b: 92.5,
  g2: 98,
  a2b: 103.83,
  a2: 110,
  b2b: 116.54,
  b2: 123.47,
  c3: 130.81,
  d3b: 138.59,
  d3: 146.83,
  e3b: 155.56,
  e3: 164.81,
  f3: 174.61,
  g3b: 185,
  g3: 196,
  a3b: 207.65,
  a3: 220,
  b3b: 233.08,
  b3: 246.94,
  c4: 261.63,
  d4b: 277.18,
  d4: 293.66,
  e4b: 311.13,
  e4: 329.63,
  f4: 349.23,
  g4b: 369.99,
  g4: 392,
  a4b: 415.3,
  a4: 440,
  b4b: 466.16,
  b4: 493.88,
  c5: 523.25,
  d5b: 554.37,
  d5: 587.33,
  e5b: 622.25,
  e5: 659.26,
  f5: 698.46,
  g5b: 739.99,
  g5: 783.99,
  a5b: 830.61,
  a5: 880,
  b5b: 932.33,
  b5: 987.77,
};

const inOrder = Object.values(PITCH);
inOrder.sort((a, b) => a - b);
export const CHROMATIC_PICHES_IN_ORDER = inOrder;
