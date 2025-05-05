import { PITCH, PitchClass, pitchMap } from '../scale/chromatic';
import { ModuleRef, defineModule } from '../WiggleContext';

export function keyboard(
  {
    label,
  }: {
    label: string;
  }
): {
  gate: ModuleRef;
  pitch: ModuleRef;
} {
  const { buttons, widget } = render(label);

  let gate: ConstantSourceNode | undefined;
  let pitch: ConstantSourceNode | undefined;

  const nodes = {
    gate: defineModule({
      create(context) {
        gate = new ConstantSourceNode(context);
        gate.offset.value = 0;
        return { node: gate, isSource: true };
      },
    }),
    pitch: defineModule({
      create(context) {
        pitch = new ConstantSourceNode(context);
        pitch.offset.value = PITCH.c4;
        return { node: pitch, isSource: true };
      },

      render() {
        return widget;
      }
    }),
  };

  for (const button of buttons) {
    button.addEventListener('mousedown', (e) => {
      if (!gate || !pitch) {
        return;
      }
      gate.offset.setValueAtTime(1, gate.context.currentTime);
      
      const frequency = pitchMap.get((e.target as HTMLButtonElement).dataset.note);
      if (frequency) {
        pitch.offset.setValueAtTime(frequency, pitch.context.currentTime);
      }
    });
    button.addEventListener('mouseup', (e) => {
      if (!gate || !pitch) {
        return;
      }
      gate.offset.setValueAtTime(0, gate.context.currentTime);
    });
  }

  return nodes;
}

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
