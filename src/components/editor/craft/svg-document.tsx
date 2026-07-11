import { useCallback, type ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import { canvasDefaults } from "../data"
import { usePlayback } from "../playback-context"
import { isDefsType } from "./defs/defs-registry"
import { DesignGrid } from "./design-grid"
import { PropFields } from "./prop-fields"
import { SelectionOverlay } from "./selection-overlay"
import { isShapeType } from "./shapes"
import { useShapeDragActive } from "./use-shape-drag-active"

type SvgDocumentProps = {
  width: number
  height: number
  viewBox: string
  preserveAspectRatio: string
  background: string
  children?: ReactNode
}

export const SvgDocument: UserComponent<Partial<SvgDocumentProps>> = ({
  width,
  height,
  viewBox,
  preserveAspectRatio,
  background,
  children,
}) => {
  const {
    connectors: { connect },
    showGrid,
  } = useNode((node) => ({
    showGrid: !!(node.data.custom as { showGrid?: boolean } | undefined)
      ?.showGrid,
  }))
  const { registerSvg } = usePlayback()
  const shapeDragging = useShapeDragActive()

  const svgRef = useCallback(
    (dom: SVGSVGElement | null) => {
      if (!dom) return
      connect(dom as unknown as HTMLElement)
      registerSvg(dom)
      return () => registerSvg(null)
    },
    [connect, registerSvg]
  )

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      style={{ background, display: "block" }}
      role="img"
      aria-label="Animation canvas"
    >
      <g style={{ pointerEvents: shapeDragging ? "none" : undefined }}>
        {children}
      </g>
      {showGrid ? <DesignGrid /> : null}
      <SelectionOverlay />
    </svg>
  )
}

SvgDocument.craft = {
  displayName: "svg",
  props: { ...canvasDefaults },
  rules: {
    canMoveIn: (incoming: Node[]) =>
      incoming.every(
        (node) => isShapeType(node.data.type) || isDefsType(node.data.type)
      ),
  },
  related: {
    settings: () => (
      <PropFields
        fields={[
          { type: "number", key: "width", label: "Width", min: 1, half: true },
          { type: "number", key: "height", label: "Height", min: 1, half: true },
          { type: "text", key: "viewBox", label: "View box", mono: true },
          {
            type: "select",
            key: "preserveAspectRatio",
            label: "Preserve aspect ratio",
            options: [
              "xMidYMid meet",
              "xMidYMid slice",
              "xMinYMin meet",
              "xMaxYMax meet",
              "none",
            ],
          },
          { type: "color", key: "background", label: "Background" },
        ]}
      />
    ),
  },
}
