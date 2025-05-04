import { ModuleRef, WiggleContext, defineModule } from '../WiggleContext';

export function slider(
  context: WiggleContext,
  {
    label,
    initialValue = 0,
    minimum = -1,
    maximum = 1,
    step = 0.01,
  }: {
    label: string;
    initialValue?: number;
    minimum?: number;
    maximum?: number;
    step?: number;
  }
): ModuleRef {
  const widget = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = label;
  const input = document.createElement('input');
  input.setAttribute('type', 'range');
  input.setAttribute('min', `${minimum}`);
  input.setAttribute('max', `${maximum}`);
  input.setAttribute('step', `${step}`);
  input.setAttribute('value', `${initialValue}`);
  const display = document.createElement('code');
  display.textContent = `${initialValue}`;
  widget.appendChild(legend);
  widget.appendChild(input);
  widget.appendChild(display);
  context.renderWidget(widget);

  return defineModule({
    create(context) {
      const node = new ConstantSourceNode(context);
      node.offset.value = initialValue;
      input.addEventListener('input', () => {
        node.offset.setValueAtTime(parseFloat(input.value), context.currentTime);
        display.textContent = `${input.value}`;
      });
      return { node, isSource: true, };
    },
  });
}
