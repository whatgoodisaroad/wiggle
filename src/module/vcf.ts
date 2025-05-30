import { Module, Patch, defineModule } from '../WiggleContext';

export const vcf = defineModule('wiggle/vcf', ({
  source,
  type,
  cutoff,
  resonance,
}: {
  source: Module;
  type: BiquadFilterType;
  cutoff: Patch;
  resonance: Patch;
}) => ({
  mapping: { source, cutoff, resonance },
  create(context) {
    const node = new BiquadFilterNode(context, { type });
    node.gain.value = 1;
    return { node };
  },
  connect(inputName, source, dest) {
    const vcf = dest as BiquadFilterNode;
    if (inputName === 'source') {
      if (typeof source === 'number') {
        throw `Invalid VCF source`;
      } else {
        source.connect(vcf);
      }
    } else if (inputName === 'cutoff') {
      if (typeof source === 'number') {
        vcf.frequency.value = source;
      } else {
        source.connect(vcf.frequency);
      }
    } else if (inputName === 'resonance') {
      if (typeof source === 'number') {
        vcf.Q.value = source;
      } else {
        source.connect(vcf.Q);
      }
    }
  }
}));
