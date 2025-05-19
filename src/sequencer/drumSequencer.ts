import { Module } from '../WiggleContext';
import { gateSequencer } from './gateSequencer';
import { sequentialSwitch } from './sequentialSwitch';

export function drumSequencer(
  {
    channels,
    clockX2,
  }: {
    channels: string[];
    clockX2: Module;
  }
): { gates: Module[]; velocities: Module[] } {
  const gates: Module[] = [];
  const velocities: Module[] = [];
  for (const channel of channels) {
    const unscaledVelocitySequence: number[] = [];
    for (let index = 0; index < channel.length; ++index) {
      const char = channel.charAt(index);
      unscaledVelocitySequence.push(
        char === ' ' 
        ? 0 
        : /^\d$/g.test(char)
        ? parseInt(char)
        : 10,
        0
      );
    }
    velocities.push(
      sequentialSwitch({
        sequence: unscaledVelocitySequence.map(
          (velocity) => velocity / 10
        ),
        trigger: clockX2,
      })
    );
    gates.push(
      gateSequencer({
        sequence: unscaledVelocitySequence.map((gain) => gain !== 0),
        trigger: clockX2,
      })
    )
  }
  return { gates, velocities };
}
