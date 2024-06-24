import { ModuleRef, WiggleContext } from '../WiggleContext';
import { adsr } from './adsr';

export function trigger(context: WiggleContext, { gate }: { gate: ModuleRef }) {
  return adsr(context, { gate: gate, decay: 0.1 });
}
