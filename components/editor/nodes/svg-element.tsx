"use client"

import * as React from "react"
import { ROOT_NODE, useEditor, useNode } from "@craftjs/core"

import { snapToAlignment } from "@/lib/editor/alignment-guides"
import { resolveTiming } from "@/lib/editor/animation"
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
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

type SvgElementProps = Partial<ElementTransformProps> & {
  children: React.ReactNode
  editing?: boolean
  onStartEditing?: () => void
}

function SvgElement({
  children,
  editing = false,
  onStartEditing,
  ...transformProps
}: SvgElementProps) {
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
          { width: SLIDE_WIDTH, height: SLIDE_HEIGHT, scale },
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

  const flip =
    flipX || flipY
      ? ` translate(${width / 2} ${height / 2}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1}) translate(${-width / 2} ${-height / 2})`
      : ""

  const filter = elementFilter(merged)
  const style =
    filter || blendMode !== "normal"
      ? {
          filter,
          mixBlendMode: blendMode !== "normal" ? blendMode : undefined,
        }
      : undefined

  // The wrapper is what the animation CSS targets. It is always rendered, so
  // adding an animation never changes the element's structure (that would
  // re-create its content and break anything measuring it); its class only
  // exists while the slide plays.
  const wrapperRef = React.useRef<SVGGElement | null>(null)
  const enters = resolveTiming(merged.timing).spans.map(
    (span) => span.enter.preset
  )
  const drawing = enters.includes("draw") || enters.includes("chart-build")

  // Draw-on needs each outline's true length; the keyframes read it from here,
  // so playback itself stays pure CSS.
  const typing = enters.includes("typewriter")
  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || (!drawing && !typing)) return
    const measure = () => {
      if (drawing) measureDrawLengths(wrapper)
      // Rotated or flipped boxes can't be measured this way; they sweep the box.
      if (typing && !merged.rotation && !merged.flipX && !merged.flipY)
        measureTextExtent(wrapper)
    }
    measure()
    // A width measured before the fonts arrive would be wrong.
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) measure()
    })
    return () => {
      cancelled = true
    }
  })

  const body = (
    <g ref={wrapperRef} className={animationClasses[id]}>
      {children}
    </g>
  )

  // Inside a group the wrapper is purely visual: the group's own SvgElement
  // handles selection and dragging for the whole subtree.
  if (nested) {
    return (
      <g
        transform={`translate(${x} ${y}) rotate(${rotation} ${width / 2} ${height / 2})${flip}`}
        opacity={opacity}
        style={style}
      >
        {children}
      </g>
    )
  }

  return (
    <g
      data-editor-node={id}
      ref={(element) => {
        if (element) connect(element as unknown as HTMLElement)
      }}
      transform={`translate(${x} ${y}) rotate(${rotation} ${width / 2} ${height / 2})${flip}`}
      opacity={opacity}
      style={style}
      className={
        editing || !enabled || locked
          ? locked && enabled
            ? "pointer-events-none"
            : undefined
          : "cursor-move"
      }
      onPointerDown={handlePointerDown}
      onDoubleClick={enabled && !locked ? onStartEditing : undefined}
    >
      {body}
      {hovered && !selected ? (
        <rect
          data-export-ignore=""
          width={width}
          height={height}
          fill="none"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          className="pointer-events-none stroke-primary"
        />
      ) : null}
    </g>
  )
}

export { SvgElement }
