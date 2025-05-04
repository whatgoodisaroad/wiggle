import { WiggleContext, defineModule } from '../WiggleContext';

export function toggle(
  context: WiggleContext,
  {
    label,
    initialState = false,
  }: {
    label: string;
    initialState?: boolean;
  }
) {
  const widget = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = label;
  const toggle = document.createElement('input');
  toggle.setAttribute('type', 'checkbox');
  toggle.checked = initialState;
  widget.appendChild(legend);
  widget.appendChild(toggle);
  context.renderWidget(widget);

  return defineModule({
    create(context) {
      const node = new ConstantSourceNode(context);
      node.offset.value = initialState ? 1 : 0;
      toggle.addEventListener('input', () => {
        node.offset.setValueAtTime(toggle.checked ? 1 : 0, context.currentTime);
      });
      return { node, isSource: true, };
    },
  });
}
