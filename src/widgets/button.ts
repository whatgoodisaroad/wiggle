import { defineModule } from '../WiggleContext';

export const button = defineModule(({
  label,
}: {
  label: string;
}) => {
  const button = document.createElement('button');
  return {
    namespace: 'wiggle/widgets/button',
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
    render() {
      const widget = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = label;
      button.textContent = label;
      widget.appendChild(legend);
      widget.appendChild(button);
      return widget;
    },
  };
});
