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

export const modules = [
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
