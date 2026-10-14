"use client"

import type { UserComponent } from "@craftjs/core"

import { strokeDashArray, type DashStyle } from "@/lib/editor/shapes"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { ElementBox } from "@/components/editor/nodes/element-box"
import { ElementSvg } from "@/components/editor/nodes/element-svg"
import { ArrowLineSettings } from "@/components/editor/settings/arrow-line-settings"

export type ArrowLineProps = ElementTransformProps & {
  color: string
  strokeWidth: number
  dashStyle: DashStyle
  arrowStart: boolean
  arrowEnd: boolean
}

type Point = { x: number; y: number }

function arrowPoints(tip: Point, from: Point, size: number) {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x)
  const left = angle + Math.PI * 0.85
  const right = angle - Math.PI * 0.85
  return [
    `${tip.x},${tip.y}`,
    `${tip.x + Math.cos(left) * size},${tip.y + Math.sin(left) * size}`,
    `${tip.x + Math.cos(right) * size},${tip.y + Math.sin(right) * size}`,
  ].join(" ")
}

const ArrowLine: UserComponent<Partial<ArrowLineProps>> = (props) => {
  const { color, strokeWidth, dashStyle, arrowStart, arrowEnd, ...transform } =
    {
      ...ArrowLine.craft!.props,
      ...props,
    } as ArrowLineProps
  const { width, height } = transform
  const p1 = { x: 0, y: 0 }
  const p2 = { x: width, y: height }
  const arrowSize = Math.max(strokeWidth * 3.5, 12)

  return (
    <ElementBox {...transform}>
      <ElementSvg width={width} height={height}>
        <line
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke="transparent"
          strokeWidth={Math.max(strokeWidth, 24)}
        />
        <line
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDashArray(dashStyle, strokeWidth)}
          strokeLinecap="round"
        />
        {arrowStart ? (
          <polygon points={arrowPoints(p1, p2, arrowSize)} fill={color} />
        ) : null}
        {arrowEnd ? (
          <polygon points={arrowPoints(p2, p1, arrowSize)} fill={color} />
        ) : null}
      </ElementSvg>
    </ElementBox>
  )
}

ArrowLine.craft = {
  displayName: "ArrowLine",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 400,
    height: 200,
    color: "#0a0a0a",
    strokeWidth: 4,
    dashStyle: "solid",
    arrowStart: false,
    arrowEnd: true,
  } satisfies ArrowLineProps,
  custom: { handles: "all" },
  related: { settings: ArrowLineSettings },
}

export { ArrowLine }
