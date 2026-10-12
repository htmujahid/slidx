"use client"

import * as React from "react"
import { useNode, type UserComponent } from "@craftjs/core"

import { SHAPES_BY_KIND, type ShapeKind } from "@/lib/editor/shapes"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { ShapeSettings } from "@/components/editor/settings/shape-settings"

export type ShapeProps = ElementTransformProps & {
  kind: ShapeKind
  fillType: "solid" | "gradient"
  gradientType: "linear" | "radial"
  fill: string
  fill2: string
  gradientAngle: number
  stroke: string
  strokeWidth: number
  dashStyle: "solid" | "dashed" | "dotted"
  cornerRadius: number
  text: string
  textColor: string
  textSize: number
}

const TEXT_FONT_FAMILY = "var(--font-sans), system-ui, sans-serif"

function dashArray(style: ShapeProps["dashStyle"], strokeWidth: number) {
  const unit = Math.max(strokeWidth, 1)
  if (style === "dashed") return `${unit * 3} ${unit * 2}`
  if (style === "dotted") return `0.1 ${unit * 2}`
  return undefined
}

function ShapeTextEditor({
  initial,
  style,
  onCommit,
  onDone,
}: {
  initial: string
  style: React.CSSProperties
  onCommit: (text: string) => void
  onDone: () => void
}) {
  const [frozen] = React.useState(initial)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    element.focus()
    const selection = window.getSelection()
    if (selection) {
      selection.selectAllChildren(element)
      selection.collapseToEnd()
    }
  }, [])

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label="Shape text"
      spellCheck={false}
      style={{ ...style, outline: 0, caretColor: style.color, minWidth: 16 }}
      onInput={(event) => onCommit(event.currentTarget.innerText ?? "")}
      onBlur={onDone}
      onKeyDown={(event) => {
        if (event.key === "Escape") onDone()
      }}
    >
      {frozen}
    </div>
  )
}

const Shape: UserComponent<Partial<ShapeProps>> = (props) => {
  const {
    kind,
    fillType,
    gradientType,
    fill,
    fill2,
    gradientAngle,
    stroke,
    strokeWidth,
    dashStyle,
    cornerRadius,
    text,
    textColor,
    textSize,
    ...transform
  } = {
    ...Shape.craft!.props,
    ...props,
  } as ShapeProps
  const definition = SHAPES_BY_KIND[kind]
  const { width, height } = transform
  const gradientId = `${React.useId().replace(/\W/g, "")}-fill`
  const gradient = definition.filled && fillType === "gradient"
  const { editing, start, stop } = useElementEditing()
  const {
    actions: { setProp },
  } = useNode()
  const withText = definition.filled && (Boolean(text) || editing)

  const textStyle: React.CSSProperties = {
    color: textColor,
    fontSize: textSize,
    fontFamily: TEXT_FONT_FAMILY,
    lineHeight: 1.25,
    textAlign: "center",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    maxWidth: "100%",
  }

  return (
    <SvgElement
      {...transform}
      editing={editing}
      onStartEditing={definition.filled ? start : undefined}
    >
      <rect width={width} height={height} fill="transparent" />
      {gradient ? (
        <defs>
          {gradientType === "radial" ? (
            <radialGradient id={gradientId}>
              <stop offset="0" stopColor={fill} />
              <stop offset="1" stopColor={fill2} />
            </radialGradient>
          ) : (
            <linearGradient
              id={gradientId}
              gradientTransform={`rotate(${gradientAngle} 0.5 0.5)`}
            >
              <stop offset="0" stopColor={fill} />
              <stop offset="1" stopColor={fill2} />
            </linearGradient>
          )}
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
        strokeDasharray={dashArray(dashStyle, strokeWidth)}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {withText ? (
        <foreignObject
          width={width}
          height={height}
          overflow="visible"
          className={editing ? undefined : "pointer-events-none select-none"}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              padding: 12,
            }}
          >
            {editing ? (
              <ShapeTextEditor
                initial={text}
                style={textStyle}
                onCommit={(next) =>
                  setProp((draft: ShapeProps) => {
                    draft.text = next
                  }, 400)
                }
                onDone={stop}
              />
            ) : (
              <div style={textStyle}>{text}</div>
            )}
          </div>
        </foreignObject>
      ) : null}
    </SvgElement>
  )
}

Shape.craft = {
  displayName: "Shape",
  props: {
    ...DEFAULT_TRANSFORM,
    kind: "rectangle",
    fillType: "solid",
    gradientType: "linear",
    fill: "#6366f1",
    fill2: "#a5b4fc",
    gradientAngle: 90,
    stroke: "#312e81",
    strokeWidth: 0,
    dashStyle: "solid",
    cornerRadius: 0,
    text: "",
    textColor: "#ffffff",
    textSize: 32,
  } satisfies ShapeProps,
  custom: { handles: "all" },
  related: { settings: ShapeSettings },
}

export { Shape }
