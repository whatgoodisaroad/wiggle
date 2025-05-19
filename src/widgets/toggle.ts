import { defineModule } from '../WiggleContext';

export function toggle(
  {
    label,
    initialState = false,
  }: {
    label: string;
    initialState?: boolean;
  }
) {
  const toggle = document.createElement('input');

  return defineModule({
    namespace: 'wiggle/widgets/toggle',
    create(context) {
      const node = new ConstantSourceNode(context);
      node.offset.value = initialState ? 1 : 0;
      toggle.addEventListener('input', () => {
        node.offset.setValueAtTime(toggle.checked ? 1 : 0, context.currentTime);
      });
      return { node, isSource: true, };
    },

    render() {
      const widget = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = label;
      toggle.setAttribute('type', 'checkbox');
      toggle.checked = initialState;
      widget.appendChild(legend);
      widget.appendChild(toggle);
      return widget
    },
  });
}
