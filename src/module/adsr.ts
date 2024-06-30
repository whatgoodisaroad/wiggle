import { ModuleRef, Patch, WiggleContext } from '../WiggleContext';

export function adsr(
  context: WiggleContext,
  { attack, decay, sustain, release, gate }: {
    attack?: Patch,
    decay?: Patch,
    sustain?: Patch,
    release?: Patch,
    gate: ModuleRef,
  }
) {
  return context.define({
    mapping: {
      attack: attack ?? 0,
      decay: decay ?? 0,
      sustain: sustain ?? 0,
      release: release ?? 0,
      gate,
    },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        "adsr-processor",
        { parameterData: { attack: 0, decay: 0, sustain: 0, release: 0 } }
      );
      return { node };
    },
    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'gate') {
        if (typeof source === 'number') {
          throw `Invalid ADSR gate`;
        }
        source.connect(worklet);
      } else if (
        ['attack', 'decay', 'sustain', 'release'].indexOf(inputName) !== -1
      ) {
        // @ts-ignore
        const param = worklet.parameters.get(inputName);
        if (!param) {
          throw `Unknown param ${inputName}`;
        }
        if (typeof source === 'number') {
          param.value = source;
        } else {
          source.connect(param);
        }
      }
    }
  });
}
