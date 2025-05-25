import {
  adsr,
  attenuverter,
  comparator,
  distortion,
  gate,
  log,
  noise,
  octave,
  output,
  quantizer,
  reverberator,
  sampleAndHold,
  sum,
  vca,
  vcf,
  vco
} from './module';
import { sequentialSwitch } from './sequencer';
import { button, keyboardInternal, scope, slider, toggle } from './widgets';
import { Module } from './WiggleContext';

const allModules = [
  adsr,
  attenuverter,
  button,
  comparator,
  distortion,
  gate,
  keyboardInternal,
  log,
  noise,
  octave,
  output,
  quantizer,
  reverberator,
  sampleAndHold,
  scope,
  sequentialSwitch,
  slider,
  sum,
  toggle,
  vca,
  vcf,
  vco
];

export const BASE_MODULES = new Map<string, (t: any) => Module>(allModules.map(m => [m.namespace, m]));
