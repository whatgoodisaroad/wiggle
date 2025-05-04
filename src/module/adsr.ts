import { ModuleRef, defineModule } from '../WiggleContext';

type Comparison = 'above' | 'below';
const minTime = 0.0001;

export function adsr(
  {
    attack = 0,
    decay = 0,
    sustain = 0,
    release = 0,
    gate,
    retrigger,
    linearAttack,
    linearDecay,
    linearRelease,
  }: {
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    gate: ModuleRef;
    retrigger?: boolean;
    linearAttack?: boolean;
    linearDecay?: boolean;
    linearRelease?: boolean;
  }
) {
  return defineModule({
    mapping: { gate },
    create(context) {
      const comparator = new AudioWorkletNode(context, "comparator-processor");
      
      const node = new ConstantSourceNode(context);
      node.offset.value = 0;

      let oldComparison: Comparison = 'below'; 
      comparator.port.onmessage = (message) => {
        const newComparison: Comparison = message.data === 'above'
          ? 'above' : 'below';
        
        if (
          newComparison === 'above' &&
          oldComparison === 'above' &&
          !retrigger
        ) {
          return;
        }

        oldComparison = newComparison;

        if (newComparison === 'above') {
          node.offset.cancelScheduledValues(context.currentTime);
          
          if (retrigger) {
            node.offset.setValueAtTime(0, context.currentTime)
          }

          scheduleAttackDecay(
            node.offset,
            context.currentTime,
            attack,
            decay,
            sustain,
            linearAttack,
            linearDecay
          );
        } else if (sustain !== 0 && release > minTime) {
          scheduleRelease(
            node.offset,
            context.currentTime,
            release,
            linearRelease
          );
        }
      };

      return { node, inputNode: comparator, isSource: true, };
    },

    connect(inputName, source, dest) {
      const worklet = dest as AudioWorkletNode;
      if (inputName === 'gate') {
        if (typeof source === 'number') {
          throw `Invalid ADSR gate`;
        }
        source.connect(worklet);
      } 
    }
  });
}

function scheduleAttackDecay(
  param: AudioParam,
  startTime: number,
  attackTime: number,
  decayTime: number,
  sustainLevel: number,
  linearAttack: boolean,
  linearDecay: boolean,
): void {
  const attackEnd = startTime + attackTime;
  const decayEnd = startTime + attackTime + decayTime;
  const attackLevel = decayTime > minTime ? 1 : sustainLevel;

  if (attackTime < minTime) {
    param.setValueAtTime(attackLevel, startTime);
  } else if (linearAttack) {
    param.linearRampToValueAtTime(attackLevel, attackEnd);
  } else {
    param.exponentialRampToValueAtTime(attackLevel, attackEnd);
  }

  if (decayTime < minTime) {
    param.setValueAtTime(sustainLevel, decayEnd);
  } else if (linearDecay) {
    param.linearRampToValueAtTime(sustainLevel, decayEnd);
  } else {
    param.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);
  }
}

function scheduleRelease(
  param: AudioParam,
  startTime: number,
  releaseTime: number,
  linearRelease: boolean,
): void {
  const releaseEnd = startTime + releaseTime;
  param.cancelScheduledValues(startTime);
  if (releaseTime < minTime) {
    param.setValueAtTime(0, startTime);
  } else if (linearRelease) {
    param.linearRampToValueAtTime(0, releaseEnd);
  } else {
    param.exponentialRampToValueAtTime(0.0001, releaseEnd);
  }
}
