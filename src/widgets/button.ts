import { WiggleContext } from '../WiggleContext';

export function button(
  context: WiggleContext,
  {
    label,
  }: {
    label: string;
  }
) {
  const widget = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = label;
  const button = document.createElement('button');
  button.textContent = label;
  widget.appendChild(legend);
  widget.appendChild(button);
  context.renderWidget(widget);

  return context.define({
    create(context) {
      const node = new ConstantSourceNode(context);
      node.offset.value = 0;
      button.addEventListener('mousedown', () => {
        node.offset.setValueAtTime(1, context.currentTime);
      });
      button.addEventListener('mouseup', () => {
        node.offset.setValueAtTime(0, context.currentTime);
      });
      return { node, isSource: true, };
    },
  });
}
