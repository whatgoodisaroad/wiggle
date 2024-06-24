import { ModuleRef, Patch, WiggleContext } from './WiggleContext';
import { adsr } from './module/adsr';
import { attenuverter } from './module/attenuverter';
import { gate } from './module/gate';
import { gateSequencer } from './module/gateSequencer';
import { output } from './module/output';
import { sequentialSwitch } from './module/sequentialSwitch';
import { vca } from './module/vca';
import { vcf } from './module/vcf';
import { vco } from './module/vco';
import { pitch } from './pitch';

let cancel = () => {};

async function newStart() {
  cancel();

  const ctx = new WiggleContext();
  
  const clockLfo = vco(ctx, { frequency: 16, shape: 'square' });
  const clock = gate(ctx, { source: clockLfo });
  const groove = gateSequencer(ctx, {
    trigger: clock,
    sequence: [true, false],
  });
  const melody = sequentialSwitch(ctx, { 
    trigger: groove,
    sequence: [pitch.g1, pitch.a1, pitch.g1]
  });
  const envelope = adsr(ctx, { gate: groove, decay: 0.2 });
  const osc = vco(ctx, { frequency: melody, shape: 'square' });
  const level = vca(ctx, { input: osc, gain: envelope });
  const filterLfo = attenuverter(ctx, {
    source: vco(ctx, { frequency: 0.77, shape: 'sine' }),
    gain: 500,
    offset: pitch.a5,
  });
  const filter = vcf(ctx, {
    source: level,
    type: 'lowpass',
    cutoff: filterLfo,
    resonance: 20,
  });
  output(ctx, { source: filter });

  ctx.reify().then((r) => cancel = r.cancel);
}

function stopAll(): void {
  cancel();
}

document.querySelector('#startButton').addEventListener('click', newStart);
document.querySelector('#stopButton').addEventListener('click', stopAll);
