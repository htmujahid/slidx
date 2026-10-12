"use client"

import * as React from "react"
import { useNode, type UserComponent } from "@craftjs/core"

import { latexToMathML } from "@/lib/editor/math"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { EquationSettings } from "@/components/editor/settings/equation-settings"

export type EquationProps = ElementTransformProps & {
  latex: string
  fontSize: number
  fill: string
}

export const DEFAULT_LATEX = "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"

const Equation: UserComponent<Partial<EquationProps>> = (props) => {
  const { latex, fontSize, fill, ...transform } = {
    ...Equation.craft!.props,
    ...props,
  } as EquationProps
  const { width, height } = transform
  const mathml = React.useMemo(() => latexToMathML(latex), [latex])
  const { editing, start, stop } = useElementEditing()
  const {
    actions: { setProp },
  } = useNode()

  return (
    <SvgElement {...transform} editing={editing} onStartEditing={start}>
      <rect width={width} height={height} fill="transparent" />
      {editing ? (
        <foreignObject width={width} height={height}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              padding: 20,
              gap: 8,
              background: "var(--popover)",
              border: "3px solid var(--primary)",
              borderRadius: "calc(var(--radius) * 1.4)",
            }}
          >
            <textarea
              autoFocus
              spellCheck={false}
              aria-label="LaTeX source"
              value={latex}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={stop}
              onKeyDown={(event) => {
                if (event.key === "Escape") stop()
              }}
              onChange={(event) => {
                const next = event.target.value
                setProp((draft: EquationProps) => {
                  draft.latex = next
                }, 400)
              }}
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                margin: 0,
                padding: 0,
                border: 0,
                outline: 0,
                resize: "none",
                background: "transparent",
                color: "var(--popover-foreground)",
                fontSize: 32,
                lineHeight: 1.4,
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            />
            <span
              style={{
                fontSize: 20,
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-sans), system-ui, sans-serif",
              }}
            >
              LaTeX · click outside or press Esc to finish
            </span>
          </div>
        </foreignObject>
      ) : (
        <foreignObject
          width={width}
          height={height}
          className="pointer-events-none"
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize,
              color: fill,
            }}
            dangerouslySetInnerHTML={{ __html: mathml }}
          />
        </foreignObject>
      )}
    </SvgElement>
  )
}

Equation.craft = {
  displayName: "Equation",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 900,
    height: 220,
    latex: DEFAULT_LATEX,
    fontSize: 72,
    fill: "#0a0a0a",
  } satisfies EquationProps,
  custom: { handles: "all" },
  related: { settings: EquationSettings },
}

export { Equation }
