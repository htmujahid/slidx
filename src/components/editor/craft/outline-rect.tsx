import { useLayoutEffect, useRef } from "react"

import { clientRectToSvgRect } from "./svg-coords"

export function OutlineRect({
  target,
  variant,
}: {
  target: { id: string; dom: HTMLElement | null; props: unknown }
  variant: "selected" | "hover"
}) {
  const outlineRef = useRef<SVGRectElement>(null)

  useLayoutEffect(() => {
    const outline = outlineRef.current
    const dom = target.dom as unknown as SVGGraphicsElement | null
    const svg = dom?.ownerSVGElement
    if (!outline) return
    if (!dom || !svg) {
      outline.setAttribute("display", "none")
      return
    }
    const padding = 2
    const rect = clientRectToSvgRect(svg, dom.getBoundingClientRect())
    outline.removeAttribute("display")
    outline.setAttribute("x", String(rect.x - padding))
    outline.setAttribute("y", String(rect.y - padding))
    outline.setAttribute("width", String(rect.width + padding * 2))
    outline.setAttribute("height", String(rect.height + padding * 2))
  }, [target.id, target.dom, target.props])

  return (
    <rect
      ref={outlineRef}
      display="none"
      fill="none"
      stroke="var(--ring)"
      strokeWidth={variant === "selected" ? 1.5 : 1}
      strokeDasharray={variant === "selected" ? undefined : "4 3"}
      opacity={variant === "selected" ? 1 : 0.6}
      vectorEffect="non-scaling-stroke"
    />
  )
}
