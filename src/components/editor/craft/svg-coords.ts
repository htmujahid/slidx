export const lastDragPosition = { x: 0, y: 0 }

export const dragSource: { kind: "shape" | "animation" | null } = {
  kind: null,
}

export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
) {
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
  return { x: point.x, y: point.y }
}

export function clientRectToSvgRect(svg: SVGSVGElement, rect: DOMRect) {
  const a = clientToSvgPoint(svg, rect.left, rect.top)
  const b = clientToSvgPoint(svg, rect.right, rect.bottom)
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  }
}
