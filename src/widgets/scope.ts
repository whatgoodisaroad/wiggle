import { ModuleRef, WiggleContext } from '../WiggleContext';

type Datum = { sample: number; timestamp: number };

export function scope(
  ctx: WiggleContext,
  {
    source,
    height = 200,
    width = 500,
    length = 1,
  }: {
    source: ModuleRef;
    height?: number;
    width?: number;
    length?: number;
  }
): ModuleRef {
  return ctx.define({
    mapping: { source },
    create(context) {
      const node = new AudioWorkletNode(
        context,
        'logging-processor',
        { processorOptions: { sampleDenominator: 1 } }
      );

      const widget = document.createElement('fieldset');

      const legend = document.createElement('legend');
      legend.textContent = 'Scope';    

      const svg = makeSvgElement('svg', {
        height,
        width,
        viewBox: `${-0.5 * width} ${-0.5 * height} ${width} ${height}`,
      });
      renderScopeGrid(svg, width, height);

      const path = makeSvgElement('path', {
        stroke: 'red',
        fill: 'transparent',
        d: '',
      });
      svg.appendChild(path);
      
      widget.appendChild(legend);
      widget.appendChild(svg);
      ctx.renderWidget(widget);

      let data: Datum[] = [];
      node.port.onmessage = (message) => {
        data = updateData(
          data,
          message.data,
          context.currentTime - length
        );
        path.setAttribute(
          'd',
          getPath(data, height, width, context.currentTime, length)
        );
      };
      
      return { node };
    },
    connect(inputName, source, dest) {
      const vca = dest as GainNode;
      if (inputName === 'source') {
        if (typeof source === 'number') {
          throw `Invalid log source`;
        } else {
          source.connect(vca);
        }
      }
    }
  });
}

function makeSvgElement(
  name: string,
  attributes?: Record<string, string | number>
): SVGElement {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const key of Object.keys(attributes ?? {})) {
    elem.setAttribute(key, `${attributes[key]}`);
  }
  return elem;
}

function renderScopeGrid(svg: SVGElement, width: number, height: number) {
  const v = makeSvgElement('line', {
    x1: 0,
    y1: -0.5 * height,
    x2: 0,
    y2: 0.5 * height,
    stroke: 'black',
  });
  const h = makeSvgElement('line', {
    x1: -0.5 * width,
    y1: 0,
    x2: 0.5 * width,
    y2: 0,
    stroke: 'black',
  });
  const g = makeSvgElement('g');
  g.appendChild(v);  
  g.append(h);  
  svg.appendChild(g);
}

function updateData(data: Datum[], datum: Datum, minTime: number): Datum[] {
  const result: Datum[] = [];
  for (let index = 0; index < data.length; ++index) {
    if (data[index].timestamp <= minTime) {
      continue;
    }
    result.push(data[index]);
  }
  if (datum.timestamp > minTime) {
    result.push(datum);
  }
  return result;
}

function getPath(
  data: Datum[],
  height: number,
  width: number,
  currentTime: number,
  length: number
): string {
  if (data.length === 0) {
    return '';
  }
  const coordinates = data.map(({ sample, timestamp }) => ({
    x: (width * (currentTime - timestamp) / length) - 0.5 * width,
    y: sample * height,
  }));
  const [{ x, y }, ...rest] = coordinates;
  const ls = rest.map(({ x, y }) => `L ${x} ${y}`);  
  return `M ${x} ${y} ${ls.join(' ')}`
}