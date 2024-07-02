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

export type Octave = 0 | 1 | 2 | 3 | 4 | 5;

const PITCHES_ARR: { pitchClass: PitchClass, octave: Octave; frequency: number }[] = [
  { pitchClass: 'c', octave: 0, frequency: 16.35 },
  { pitchClass: 'db', octave: 0, frequency: 17.32 },
  { pitchClass: 'd', octave: 0, frequency: 18.35 },
  { pitchClass: 'eb', octave: 0, frequency: 19.45 },
  { pitchClass: 'e', octave: 0, frequency: 20.6 },
  { pitchClass: 'f', octave: 0, frequency: 21.83 },
  { pitchClass: 'gb', octave: 0, frequency: 23.12 },
  { pitchClass: 'g', octave: 0, frequency: 24.5 },
  { pitchClass: 'ab', octave: 0, frequency: 25.96 },
  { pitchClass: 'a', octave: 0, frequency: 27.5 },
  { pitchClass: 'bb', octave: 0, frequency: 29.14 },
  { pitchClass: 'b', octave: 0, frequency: 30.87 },
  { pitchClass: 'c', octave: 1, frequency: 32.7 },
  { pitchClass: 'db', octave: 1, frequency: 34.65 },
  { pitchClass: 'd', octave: 1, frequency: 36.71 },
  { pitchClass: 'eb', octave: 1, frequency: 38.89 },
  { pitchClass: 'e', octave: 1, frequency: 41.2 },
  { pitchClass: 'f', octave: 1, frequency: 43.65 },
  { pitchClass: 'gb', octave: 1, frequency: 46.25 },
  { pitchClass: 'g', octave: 1, frequency: 49 },
  { pitchClass: 'ab', octave: 1, frequency: 51.91 },
  { pitchClass: 'a', octave: 1, frequency: 55 },
  { pitchClass: 'bb', octave: 1, frequency: 58.27 },
  { pitchClass: 'b', octave: 1, frequency: 61.74 },
  { pitchClass: 'c', octave: 2, frequency: 65.41 },
  { pitchClass: 'db', octave: 2, frequency: 69.3 },
  { pitchClass: 'd', octave: 2, frequency: 73.42 },
  { pitchClass: 'eb', octave: 2, frequency: 77.78 },
  { pitchClass: 'e', octave: 2, frequency: 82.41 },
  { pitchClass: 'f', octave: 2, frequency: 87.31 },
  { pitchClass: 'gb', octave: 2, frequency: 92.5 },
  { pitchClass: 'g', octave: 2, frequency: 98 },
  { pitchClass: 'ab', octave: 2, frequency: 103.83 },
  { pitchClass: 'a', octave: 2, frequency: 110 },
  { pitchClass: 'bb', octave: 2, frequency: 116.54 },
  { pitchClass: 'b', octave: 2, frequency: 123.47 },
  { pitchClass: 'c', octave: 3, frequency: 130.81 },
  { pitchClass: 'db', octave: 3, frequency: 138.59 },
  { pitchClass: 'd', octave: 3, frequency: 146.83 },
  { pitchClass: 'eb', octave: 3, frequency: 155.56 },
  { pitchClass: 'e', octave: 3, frequency: 164.81 },
  { pitchClass: 'f', octave: 3, frequency: 174.61 },
  { pitchClass: 'gb', octave: 3, frequency: 185 },
  { pitchClass: 'g', octave: 3, frequency: 196 },
  { pitchClass: 'ab', octave: 3, frequency: 207.65 },
  { pitchClass: 'a', octave: 3, frequency: 220 },
  { pitchClass: 'bb', octave: 3, frequency: 233.08 },
  { pitchClass: 'b', octave: 3, frequency: 246.94 },
  { pitchClass: 'c', octave: 4, frequency: 261.63 },
  { pitchClass: 'db', octave: 4, frequency: 277.18 },
  { pitchClass: 'd', octave: 4, frequency: 293.66 },
  { pitchClass: 'eb', octave: 4, frequency: 311.13 },
  { pitchClass: 'e', octave: 4, frequency: 329.63 },
  { pitchClass: 'f', octave: 4, frequency: 349.23 },
  { pitchClass: 'gb', octave: 4, frequency: 369.99 },
  { pitchClass: 'g', octave: 4, frequency: 392 },
  { pitchClass: 'ab', octave: 4, frequency: 415.3 },
  { pitchClass: 'a', octave: 4, frequency: 440 },
  { pitchClass: 'bb', octave: 4, frequency: 466.16 },
  { pitchClass: 'b', octave: 4, frequency: 493.88 },
  { pitchClass: 'c', octave: 5, frequency: 523.25 },
  { pitchClass: 'db', octave: 5, frequency: 554.37 },
  { pitchClass: 'd', octave: 5, frequency: 587.33 },
  { pitchClass: 'eb', octave: 5, frequency: 622.25 },
  { pitchClass: 'e', octave: 5, frequency: 659.26 },
  { pitchClass: 'f', octave: 5, frequency: 698.46 },
  { pitchClass: 'gb', octave: 5, frequency: 739.99 },
  { pitchClass: 'g', octave: 5, frequency: 783.99 },
  { pitchClass: 'ab', octave: 5, frequency: 830.61 },
  { pitchClass: 'a', octave: 5, frequency: 880 },
  { pitchClass: 'bb', octave: 5, frequency: 932.33 },
  { pitchClass: 'b', octave: 5, frequency: 987.77 },
];

const pitchMap = new Map<string, number>(
  PITCHES_ARR.map(
    ({ pitchClass, octave, frequency }) => [`${pitchClass}${octave}`, frequency]
  )
);

export function getPitch(pitchClass: PitchClass, octave: Octave): number {
  return pitchMap.get(`${pitchClass}${octave}`);
}

export const PITCH = {
  c0: pitchMap.get('c0'),
  d0b: pitchMap.get('db0'),
  d0: pitchMap.get('d0'),
  e0b: pitchMap.get('eb0'),
  e0: pitchMap.get('e0'),
  f0: pitchMap.get('f0'),
  g0b: pitchMap.get('gb0'),
  g0: pitchMap.get('g0'),
  a0b: pitchMap.get('ab0'),
  a0: pitchMap.get('a0'),
  b0b: pitchMap.get('ab0'),
  b0: pitchMap.get('b0'),
  c1: pitchMap.get('c1'),
  d1b: pitchMap.get('db1'),
  d1: pitchMap.get('d1'),
  e1b: pitchMap.get('eb1'),
  e1: pitchMap.get('e1'),
  f1: pitchMap.get('f1'),
  g1b: pitchMap.get('gb1'),
  g1: pitchMap.get('g1'),
  a1b: pitchMap.get('ab1'),
  a1: pitchMap.get('a1'),
  b1b: pitchMap.get('bb1'),
  b1: pitchMap.get('b1'),
  c2: pitchMap.get('c2'),
  d2b: pitchMap.get('db2'),
  d2: pitchMap.get('d2'),
  e2b: pitchMap.get('eb2'),
  e2: pitchMap.get('e2'),
  f2: pitchMap.get('f2'),
  g2b: pitchMap.get('gb2'),
  g2: pitchMap.get('g2'),
  a2b: pitchMap.get('ab2'),
  a2: pitchMap.get('a2'),
  b2b: pitchMap.get('bb2'),
  b2: pitchMap.get('b2'),
  c3: pitchMap.get('c3'),
  d3b: pitchMap.get('db3'),
  d3: pitchMap.get('d3'),
  e3b: pitchMap.get('eb3'),
  e3: pitchMap.get('e3'),
  f3: pitchMap.get('f3'),
  g3b: pitchMap.get('gb3'),
  g3: pitchMap.get('g3'),
  a3b: pitchMap.get('ab3'),
  a3: pitchMap.get('a3'),
  b3b: pitchMap.get('bb3'),
  b3: pitchMap.get('b3'),
  c4: pitchMap.get('c4'),
  d4b: pitchMap.get('db4'),
  d4: pitchMap.get('d4'),
  e4b: pitchMap.get('eb4'),
  e4: pitchMap.get('e4'),
  f4: pitchMap.get('f4'),
  g4b: pitchMap.get('gb4'),
  g4: pitchMap.get('g4'),
  a4b: pitchMap.get('ab4'),
  a4: pitchMap.get('a4'),
  b4b: pitchMap.get('bb4'),
  b4: pitchMap.get('b4'),
  c5: pitchMap.get('c5'),
  d5b: pitchMap.get('db5'),
  d5: pitchMap.get('d5'),
  e5b: pitchMap.get('eb5'),
  e5: pitchMap.get('e5'),
  f5: pitchMap.get('f5'),
  g5b: pitchMap.get('db5'),
  g5: pitchMap.get('g5'),
  a5b: pitchMap.get('ab5'),
  a5: pitchMap.get('a5'),
  b5b: pitchMap.get('bb5'),
  b5: pitchMap.get('b5'),
};

const inOrder = Object.values(PITCH);
inOrder.sort((a, b) => a - b);
export const CHROMATIC_PICHES_IN_ORDER = inOrder;
