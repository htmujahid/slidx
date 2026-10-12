"use client"

import * as React from "react"
import type { UserComponent } from "@craftjs/core"

import { SHAPES_BY_KIND, type ShapeKind } from "@/lib/editor/shapes"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { ShapeSettings } from "@/components/editor/settings/shape-settings"

export type ShapeProps = ElementTransformProps & {
  kind: ShapeKind
  fillType: "solid" | "gradient"
  fill: string
  fill2: string
  gradientAngle: number
  stroke: string
  strokeWidth: number
  cornerRadius: number
}

const Shape: UserComponent<Partial<ShapeProps>> = (props) => {
  const {
    kind,
    fillType,
    fill,
    fill2,
    gradientAngle,
    stroke,
    strokeWidth,
    cornerRadius,
    ...transform
  } = {
    ...Shape.craft!.props,
    ...props,
  } as ShapeProps
  const definition = SHAPES_BY_KIND[kind]
  const { width, height } = transform
  const gradientId = `${React.useId().replace(/\W/g, "")}-fill`
  const gradient = definition.filled && fillType === "gradient"

  return (
    <SvgElement {...transform}>
      <rect width={width} height={height} fill="transparent" />
      {gradient ? (
        <defs>
          <linearGradient
            id={gradientId}
            gradientTransform={`rotate(${gradientAngle} 0.5 0.5)`}
          >
            <stop offset="0" stopColor={fill} />
            <stop offset="1" stopColor={fill2} />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d={definition.path(width, height, { cornerRadius })}
        fill={
          definition.filled ? (gradient ? `url(#${gradientId})` : fill) : "none"
        }
        fillRule={definition.fillRule}
        stroke={definition.filled ? stroke : fill}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </SvgElement>
  )
}

Shape.craft = {
  displayName: "Shape",
  props: {
    ...DEFAULT_TRANSFORM,
    kind: "rectangle",
    fillType: "solid",
    fill: "#6366f1",
    fill2: "#a5b4fc",
    gradientAngle: 90,
    stroke: "#312e81",
    strokeWidth: 0,
    cornerRadius: 0,
  } satisfies ShapeProps,
  custom: { handles: "all" },
  related: { settings: ShapeSettings },
}

export { Shape }
