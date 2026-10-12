"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"

import { MIN_ELEMENT_SIZE } from "@/lib/editor/constants"
import {
  elementBounds,
  normalizeAngle,
  rotatePoint,
  roundTo,
  snapValue,
  toDegrees,
  trackPointer,
} from "@/lib/editor/geometry"
import type { ElementTransformProps } from "@/lib/editor/types"
import { cn } from "@/lib/utils"
import { useOptionalEditorLayout } from "@/components/editor/editor-layout"
import { useSlide } from "@/components/editor/slide-context"

type Handle = { id: string; sx: -1 | 0 | 1; sy: -1 | 0 | 1; cursor: string }

const HANDLES: Handle[] = [
  { id: "nw", sx: -1, sy: -1, cursor: "cursor-nwse-resize" },
  { id: "n", sx: 0, sy: -1, cursor: "cursor-ns-resize" },
  { id: "ne", sx: 1, sy: -1, cursor: "cursor-nesw-resize" },
  { id: "e", sx: 1, sy: 0, cursor: "cursor-ew-resize" },
  { id: "se", sx: 1, sy: 1, cursor: "cursor-nwse-resize" },
  { id: "s", sx: 0, sy: 1, cursor: "cursor-ns-resize" },
  { id: "sw", sx: -1, sy: 1, cursor: "cursor-nesw-resize" },
  { id: "w", sx: -1, sy: 0, cursor: "cursor-ew-resize" },
]

const HANDLE_SIZE = 10
const ROTATE_OFFSET = 28

function MultiSelectionOverlay({
  nodes,
}: {
  nodes: { id: string; props: ElementTransformProps }[]
}) {
  const bounds = nodes.map((node) => elementBounds(node.props))
  const left = Math.min(...bounds.map((b) => b.left))
  const top = Math.min(...bounds.map((b) => b.top))
  const right = Math.max(...bounds.map((b) => b.right))
  const bottom = Math.max(...bounds.map((b) => b.bottom))

  return (
    <g data-export-ignore="" className="pointer-events-none stroke-primary">
      {nodes.map(({ id, props }) => (
        <rect
          key={id}
          x={-props.width / 2}
          y={-props.height / 2}
          width={props.width}
          height={props.height}
          transform={`translate(${props.x + props.width / 2} ${props.y + props.height / 2}) rotate(${props.rotation})`}
          fill="none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <rect
        x={left}
        y={top}
        width={right - left}
        height={bottom - top}
        fill="none"
        strokeWidth={1}
        strokeDasharray="6 4"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  )
}

function SelectionOverlay() {
  const { actions, nodes, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
    nodes: [...state.events.selected]
      .filter((id) => id !== ROOT_NODE && state.nodes[id])
      .map((id) => {
        const node = state.nodes[id]
        return {
          id,
          props: node.data.props as ElementTransformProps,
          handles: (node.data.custom.handles ?? "all") as
            "all" | "horizontal" | "none",
          locked: Boolean(node.data.custom.locked),
        }
      }),
  }))
  const { scale, toSlidePoint, grid } = useSlide()
  const editingId = useOptionalEditorLayout()?.editingId

  if (!enabled || nodes.length === 0) return null
  if (nodes.length > 1) return <MultiSelectionOverlay nodes={nodes} />

  const [selected] = nodes
  if (selected.id === editingId) return null
  if (selected.locked) return <MultiSelectionOverlay nodes={nodes} />

  const { id, props, handles } = selected
  const { x, y, width, height, rotation } = props
  const center = { x: x + width / 2, y: y + height / 2 }
  const px = 1 / scale
  const size = HANDLE_SIZE * px

  const startResize = (handle: Handle) => (event: React.PointerEvent) => {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    const anchorLocal = {
      x: -handle.sx * (width / 2),
      y: -handle.sy * (height / 2),
    }
    const rotatedAnchor = rotatePoint(anchorLocal, rotation)
    const anchor = {
      x: center.x + rotatedAnchor.x,
      y: center.y + rotatedAnchor.y,
    }

    trackPointer((move) => {
      const pointer = toSlidePoint(move.clientX, move.clientY)
      const local = rotatePoint(
        { x: pointer.x - anchor.x, y: pointer.y - anchor.y },
        -rotation
      )
      let nextWidth = handle.sx
        ? Math.max(MIN_ELEMENT_SIZE, snapValue(handle.sx * local.x, grid))
        : width
      let nextHeight =
        handle.sy && handles === "all"
          ? Math.max(MIN_ELEMENT_SIZE, snapValue(handle.sy * local.y, grid))
          : height
      if (move.shiftKey && handle.sx && handle.sy && handles === "all") {
        const factor = Math.max(nextWidth / width, nextHeight / height)
        nextWidth = Math.max(MIN_ELEMENT_SIZE, width * factor)
        nextHeight = Math.max(MIN_ELEMENT_SIZE, height * factor)
      }

      const nextAnchorLocal = {
        x: -handle.sx * (nextWidth / 2),
        y: -handle.sy * (nextHeight / 2),
      }
      const offset = rotatePoint(nextAnchorLocal, rotation)
      const nextCenter = { x: anchor.x - offset.x, y: anchor.y - offset.y }

      actions.history.throttle(400).setProp(id, (p) => {
        p.width = roundTo(nextWidth)
        p.height = roundTo(nextHeight)
        p.x = roundTo(nextCenter.x - nextWidth / 2)
        p.y = roundTo(nextCenter.y - nextHeight / 2)
      })
    })
  }

  const startRotate = (event: React.PointerEvent) => {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    trackPointer((move) => {
      const pointer = toSlidePoint(move.clientX, move.clientY)
      let angle =
        toDegrees(Math.atan2(pointer.y - center.y, pointer.x - center.x)) + 90
      if (move.shiftKey) angle = Math.round(angle / 15) * 15
      actions.history.throttle(400).setProp(id, (p) => {
        p.rotation = roundTo(normalizeAngle(angle))
      })
    })
  }

  const visibleHandles =
    handles === "all"
      ? HANDLES
      : handles === "horizontal"
        ? HANDLES.filter((handle) => handle.sy === 0)
        : []

  return (
    <g
      data-export-ignore=""
      data-editor-node={id}
      transform={`translate(${center.x} ${center.y}) rotate(${rotation})`}
    >
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className="pointer-events-none stroke-primary"
      />
      <line
        x1={0}
        x2={0}
        y1={-height / 2}
        y2={-height / 2 - ROTATE_OFFSET * px}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className="pointer-events-none stroke-primary"
      />
      <circle
        cx={0}
        cy={-height / 2 - ROTATE_OFFSET * px}
        r={size / 1.6}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className="cursor-grab fill-white stroke-primary active:cursor-grabbing"
        onPointerDown={startRotate}
      />
      {visibleHandles.map((handle) => (
        <rect
          key={handle.id}
          x={(handle.sx * width) / 2 - size / 2}
          y={(handle.sy * height) / 2 - size / 2}
          width={size}
          height={size}
          rx={size / 5}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          className={cn("fill-white stroke-primary", handle.cursor)}
          onPointerDown={startResize(handle)}
        />
      ))}
    </g>
  )
}

export { SelectionOverlay }
