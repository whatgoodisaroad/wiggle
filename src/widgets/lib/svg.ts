export function makeSvgElement(
  name: string,
  attributes?: Record<string, string | number>
): SVGElement {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const key of Object.keys(attributes ?? {})) {
    elem.setAttribute(key, `${attributes[key]}`);
  }
  return elem;
}