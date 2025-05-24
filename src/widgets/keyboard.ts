import { comparator } from '../module';
import { PitchClass, pitchMap } from '../scale/chromatic';
import { Module, defineModule } from '../WiggleContext';

export function keyboard(
  {
    label,
  }: {
    label: string;
  }
): {
  gate: Module;
  pitch: Module;
} {
  const pitch = keyboardInternal({ label });
  const gate = comparator({ source: pitch });
  return { gate, pitch };
}

export const keyboardInternal = defineModule(({
  label,
}: {
  label: string;
}) => {
  let pitch: ConstantSourceNode | undefined;
  return {
    namespace: 'wiggle/keyboardInternal',
    create(context) {
      pitch = new ConstantSourceNode(context);
      return { node: pitch, isSource: true };
    },
    render() {
      const { buttons, widget } = render(label);

      for (const button of buttons) {
        button.addEventListener('mousedown', (e) => {
          if (!pitch) {
            return;
          }
          const frequency = pitchMap.get((e.target as HTMLButtonElement).dataset.note);
          if (frequency) {
            pitch.offset.setValueAtTime(frequency, pitch.context.currentTime);
          }
        });
        button.addEventListener('mouseup', (e) => {
          if (!pitch) {
            return;
          }
          pitch.offset.setValueAtTime(0, pitch.context.currentTime);
        });
      }

      return widget;
    },
  };
});

function render(label: string): { widget: HTMLElement; buttons: HTMLButtonElement[] } {
  const widget = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = label;
  widget.appendChild(legend);

  const pitchClasses: PitchClass[] = [
    'c',
    'db',
    'd',
    'eb',
    'e',
    'f',
    'gb',
    'g',
    'ab',
    'a',
    'bb',
    'b',
  ];
  const naturalWidth = 50;
  const naturalHeight = 200;
  const flatWidth = 40;
  const flatHeight = 120;

  const container = document.createElement('div');
  container.setAttribute('style', `
    position: relative;
    height: ${naturalHeight + 10}px;
  `);
  widget.appendChild(container);

  const buttons: HTMLButtonElement[] = [];
  let offset = 0;
  for (const octave of [4, 5]) {
    for (const pitchClass of pitchClasses) {
      const isFlat = pitchClass[1] === 'b';
      const button = document.createElement('button');
      button.setAttribute('style', `
        background: ${isFlat ? 'black' : 'white'};
        box-sizing: border-box;
        color: ${isFlat ? 'white' : 'black'};
        cursor: pointer;
        font-size: 10px;
        height: ${isFlat ? flatHeight : naturalHeight};
        left: ${isFlat ? offset - 0.5 * flatWidth : offset}px;
        position: absolute;
        top: 0;
        width: ${isFlat ? flatWidth : naturalWidth};
        z-index: ${isFlat ? 1 : 0};
      `);
      if (!isFlat) {
        offset += naturalWidth;
      }
      const name = `${pitchClass}${octave}`;
      button.textContent = name;
      button.dataset.note = name;
      
      const flats: HTMLButtonElement[] = [];
      if (isFlat) {
        flats.push(button);        
      } else {
        container.appendChild(button);
      }

      for (const flat of flats) {
        container.appendChild(flat);
      }

      buttons.push(button);
    }
  }

  return { widget, buttons };
}
