import { defineModule } from '../WiggleContext';

export const slider = defineModule((
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
) => {
  const input = document.createElement('input');
  const display = document.createElement('code');
  return {
    namespace: 'wiggle/widgets/slider',
    create(context) {
      const node = new ConstantSourceNode(context);
      node.offset.value = initialValue;
      input.addEventListener('input', () => {
        node.offset.setValueAtTime(parseFloat(input.value), context.currentTime);
        display.textContent = `${input.value}`;
      });
      return { node, isSource: true, };
    },

    render() {
      const widget = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = label;
      input.setAttribute('type', 'range');
      input.setAttribute('min', `${minimum}`);
      input.setAttribute('max', `${maximum}`);
      input.setAttribute('step', `${step}`);
      input.setAttribute('value', `${initialValue}`);
      display.textContent = `${initialValue}`;
      widget.appendChild(legend);
      widget.appendChild(input);
      widget.appendChild(display);
      return widget;
    },
  };
});
