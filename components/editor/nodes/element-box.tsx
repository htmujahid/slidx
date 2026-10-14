"use client"

import * as React from "react"
import { ROOT_NODE, useEditor, useNode } from "@craftjs/core"

import { snapToAlignment } from "@/lib/editor/alignment-guides"
import { resolveTiming } from "@/lib/editor/animation"
import {
  roundTo,
  swallowNextClick,
  swallowNextEvents,
  trackPointer,
} from "@/lib/editor/geometry"
import {
  measureDrawLengths,
  measureTextExtent,
} from "@/lib/editor/measure-animation"
import {
  DEFAULT_TRANSFORM,
  elementFilter,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { useSlide } from "@/components/editor/slide-context"

type ElementBoxProps = Partial<ElementTransformProps> & {
  children: React.ReactNode
  editing?: boolean
  onStartEditing?: () => void
}

function ElementBox({
  children,
  editing = false,
  onStartEditing,
  ...transformProps
}: ElementBoxProps) {
  const merged = { ...DEFAULT_TRANSFORM, ...transformProps }
  const { x, y, width, height, rotation, opacity, flipX, flipY, blendMode } =
    merged
  const {
    id,
    connectors: { connect },
    hovered,
    selected,
    locked,
  } = useNode((node) => ({
    hovered: node.events.hovered,
    selected: node.events.selected,
    locked: Boolean(node.data.custom.locked),
  }))
  const { actions, query, enabled, nested } = useEditor((state) => ({
    enabled: state.options.enabled,
    nested: Boolean(id && state.nodes[id]?.data.parent !== ROOT_NODE),
  }))
  const {
    toSlidePoint,
    grid,
    scale,
    setGuides,
    snapToAlignment: alignmentEnabled,
    animationClasses,
    width: slideWidth,
    height: slideHeight,
  } = useSlide()
  const endDrag = React.useRef<(() => void) | null>(null)
  React.useEffect(() => () => endDrag.current?.(), [])

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0 || editing || !enabled || locked) return
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      swallowNextEvents(["mousedown", "click"])
      const selectedIds = query
        .getEvent("selected")
        .all()
        .filter((selectedId) => selectedId !== ROOT_NODE)
      const next = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
      actions.selectNode(next.length > 0 ? next : undefined)
      return
    }
    endDrag.current?.()
    const selectedIds = query
      .getEvent("selected")
      .all()
      .filter((selectedId) => selectedId !== ROOT_NODE)
    const dragIds = selectedIds.includes(id) ? selectedIds : [id]
    if (!selectedIds.includes(id)) actions.selectNode(id)
    const start = toSlidePoint(event.clientX, event.clientY)
    const origin = { ...merged }
    const origins = new Map(
      dragIds.map((dragId) => {
        const props = query.node(dragId).get().data.props
        return [dragId, { ...(props as ElementTransformProps) }]
      })
    )
    const peers = query
      .node(ROOT_NODE)
      .get()
      .data.nodes.filter((peerId) => !dragIds.includes(peerId))
      .map(
        (peerId) => query.node(peerId).get().data.props as ElementTransformProps
      )
    let moved = false
    let last = { x, y }
    endDrag.current = trackPointer(
      (move) => {
        if (
          !moved &&
          Math.hypot(
            move.clientX - event.clientX,
            move.clientY - event.clientY
          ) < 3
        )
          return
        const point = toSlidePoint(move.clientX, move.clientY)
        let dx = point.x - start.x
        let dy = point.y - start.y
        const lock = move.shiftKey
          ? Math.abs(dx) >= Math.abs(dy)
            ? "x"
            : "y"
          : null
        if (lock === "x") dy = 0
        if (lock === "y") dx = 0
        const next = snapToAlignment(
          { ...origin, x: origin.x + dx, y: origin.y + dy },
          peers,
          { width: slideWidth, height: slideHeight, scale },
          grid,
          move.altKey,
          alignmentEnabled
        )
        setGuides(next.guides)
        const position = {
          x: lock === "y" ? origin.x : roundTo(next.x, 3),
          y: lock === "x" ? origin.y : roundTo(next.y, 3),
        }
        if (position.x === last.x && position.y === last.y) return
        const deltaX = position.x - origin.x
        const deltaY = position.y - origin.y
        let merge = moved
        for (const [dragId, from] of origins) {
          const history = merge ? actions.history.merge() : actions
          history.setProp(dragId, (props) => {
            props.x = roundTo(from.x + deltaX, 3)
            props.y = roundTo(from.y + deltaY, 3)
          })
          merge = true
        }
        last = position
        moved = true
      },
      () => {
        if (moved) swallowNextClick()
        setGuides([])
        endDrag.current = null
      },
      event.pointerId
    )
  }

  const filter = elementFilter(merged)

  const transform =
    [
      rotation ? `rotate(${rotation}deg)` : "",
      flipX || flipY ? `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined
  const box: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    transform,
    opacity: opacity === 1 ? undefined : opacity,
    filter,
    mixBlendMode: blendMode !== "normal" ? blendMode : undefined,
  }

  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const enters = resolveTiming(merged.timing).spans.map(
    (span) => span.enter.preset
  )
  const drawing = enters.includes("draw") || enters.includes("chart-build")

  const typing = enters.includes("typewriter")
  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || (!drawing && !typing)) return
    const measure = () => {
      if (drawing) measureDrawLengths(wrapper)
      if (typing && !merged.rotation && !merged.flipX && !merged.flipY)
        measureTextExtent(wrapper)
    }
    measure()
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) measure()
    })
    return () => {
      cancelled = true
    }
  })

  const body = (
    <div
      ref={wrapperRef}
      className={animationClasses[id]}
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </div>
  )

  if (nested) return <div style={box}>{body}</div>

  return (
    <div
      data-editor-node={id}
      ref={(element) => {
        if (element) connect(element)
      }}
      style={{
        ...box,
        cursor: editing || !enabled || locked ? undefined : "move",
        pointerEvents: locked && enabled ? "none" : undefined,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={enabled && !locked ? onStartEditing : undefined}
    >
      {body}
      {hovered && !selected ? (
        <div
          data-export-ignore=""
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            outline: "calc(2px / var(--vx-zoom, 1)) solid var(--primary)",
          }}
        />
      ) : null}
    </div>
  )
}

function ElementSvg({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: React.ReactNode
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
      style={{ position: "absolute", left: 0, top: 0, display: "block" }}
    >
      {children}
    </svg>
  )
}

export { ElementBox, ElementSvg }
