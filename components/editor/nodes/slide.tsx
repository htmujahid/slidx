"use client"

import * as React from "react"
import {
  ROOT_NODE,
  useEditor,
  useNode,
  type UserComponent,
} from "@craftjs/core"
import { useShallow } from "zustand/react/shallow"

import type { AlignmentGuide } from "@/lib/editor/alignment-guides"
import { buildAnimationCss } from "@/lib/editor/animation/css"
import {
  elementBounds,
  swallowNextClick,
  swallowNextEvents,
  trackPointer,
} from "@/lib/editor/geometry"
import { LIBRARY_DRAG_TYPE } from "@/lib/editor/library/types"
import {
  linearGradientPoints,
  SLIDE_DEFAULTS,
  type SlideProps,
} from "@/lib/editor/slide-props"
import { slideSizeOf } from "@/lib/editor/slide-size"
import { slideTimeline } from "@/lib/editor/slide-timeline"
import { usePreview } from "@/lib/editor/stores/preview-store"
import { useViewport } from "@/lib/editor/stores/viewport-store"
import type { ElementTransformProps } from "@/lib/editor/types"
import { cn } from "@/lib/utils"
import { useEditorActions } from "@/hooks/use-editor-actions"
import { usePlayback } from "@/components/editor/animation-playback"
import { SelectionOverlay } from "@/components/editor/nodes/selection-overlay"
import { SlideSettings } from "@/components/editor/settings/slide-settings"
import { SlideContext } from "@/components/editor/slide-context"
import { useAssetSrc } from "@/components/storage-provider"

type SlideNodeProps = Partial<SlideProps> & { children?: React.ReactNode }

const Slide: UserComponent<SlideNodeProps> = ({ children, ...props }) => {
  const {
    backgroundType,
    background,
    gradientType,
    gradientFrom,
    gradientTo,
    gradientAngle,
    backgroundImage,
    imageFit,
    showGrid,
    gridSize,
    snapToGrid,
    snapToAlignment,
  } = { ...SLIDE_DEFAULTS, ...props }
  const { width: SLIDE_WIDTH, height: SLIDE_HEIGHT } = slideSizeOf(props)
  const backgroundSrc = useAssetSrc(backgroundImage)
  const {
    connectors: { connect },
  } = useNode()
  const { actions, query, editable, nodes } = useEditor((state) => ({
    editable: state.options.enabled,
    nodes: state.nodes,
  }))
  const uid = React.useId().replace(/\W/g, "")
  const GRID_ID = `${uid}-grid`
  const GRADIENT_ID = `${uid}-gradient`
  const line = linearGradientPoints(gradientAngle, SLIDE_WIDTH, SLIDE_HEIGHT)
  const { addLibraryItem } = useEditorActions()
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const surfaceRef = React.useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = React.useState(1)
  const [guides, setGuides] = React.useState<AlignmentGuide[]>([])
  const setCanvasScale = useViewport((state) => state.setCanvasScale)

  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / SLIDE_WIDTH || 1)
    })
    observer.observe(section)
    return () => observer.disconnect()
  }, [SLIDE_WIDTH])

  React.useEffect(() => {
    if (editable) setCanvasScale(scale)
  }, [editable, scale, setCanvasScale])

  const toSlidePoint = React.useCallback(
    (clientX: number, clientY: number) => {
      const rect = surfaceRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return {
        x: ((clientX - rect.left) / rect.width) * SLIDE_WIDTH,
        y: ((clientY - rect.top) / rect.height) * SLIDE_HEIGHT,
      }
    },
    [SLIDE_WIDTH, SLIDE_HEIGHT]
  )

  const playback = usePlayback()
  const editorPreview = usePreview(
    useShallow(({ mode, run, time }) => ({ mode, run, time }))
  )
  const preview = editable ? editorPreview : undefined
  const playing =
    playback.play || (preview !== undefined && preview.mode !== "off")
  const pausedAt = preview?.mode === "scrub" ? preview.time : undefined
  const run = playback.run + (preview?.run ?? 0)

  const timeline = React.useMemo(() => slideTimeline(nodes), [nodes])

  const animation = React.useMemo(
    () =>
      playing
        ? buildAnimationCss(uid, run, timeline, { pausedAt })
        : { css: "", classes: {} as Record<string, string> },
    [playing, uid, run, timeline, pausedAt]
  )

  const context = React.useMemo(
    () => ({
      scale,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      setGuides,
      snapToAlignment,
      toSlidePoint,
      grid: { snap: snapToGrid, size: gridSize },
      animationClasses: animation.classes,
    }),
    [
      scale,
      SLIDE_WIDTH,
      SLIDE_HEIGHT,
      toSlidePoint,
      snapToGrid,
      gridSize,
      snapToAlignment,
      animation.classes,
    ]
  )

  const handleDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(LIBRARY_DRAG_TYPE)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  const [marquee, setMarquee] = React.useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const handleCanvasPointerDown = (event: React.PointerEvent) => {
    const onElement = (event.target as Element).closest("[data-editor-node]")
    if (!onElement) actions.clearEvents()
    if (!editable || event.button !== 0 || onElement) return
    const start = toSlidePoint(event.clientX, event.clientY)
    const base =
      event.shiftKey || event.metaKey || event.ctrlKey
        ? query
            .getEvent("selected")
            .all()
            .filter((id) => id !== ROOT_NODE)
        : []
    if (base.length > 0) swallowNextEvents(["mousedown", "click"])
    let dragged = false
    trackPointer(
      (move) => {
        if (
          !dragged &&
          Math.hypot(
            move.clientX - event.clientX,
            move.clientY - event.clientY
          ) < 3
        )
          return
        dragged = true
        const point = toSlidePoint(move.clientX, move.clientY)
        const rect = {
          x: Math.min(start.x, point.x),
          y: Math.min(start.y, point.y),
          width: Math.abs(point.x - start.x),
          height: Math.abs(point.y - start.y),
        }
        setMarquee(rect)
        const hit = query
          .node(ROOT_NODE)
          .get()
          .data.nodes.filter((id) => {
            const { data } = query.node(id).get()
            if (data.hidden || data.custom.locked) return false
            const bounds = elementBounds(data.props as ElementTransformProps)
            return (
              bounds.left < rect.x + rect.width &&
              bounds.right > rect.x &&
              bounds.top < rect.y + rect.height &&
              bounds.bottom > rect.y
            )
          })
        const ids = [...new Set([...base, ...hit])]
        actions.selectNode(ids.length > 0 ? ids : undefined)
      },
      () => {
        if (dragged) swallowNextClick()
        setMarquee(null)
      },
      event.pointerId
    )
  }

  const handleDrop = (event: React.DragEvent) => {
    const itemId = event.dataTransfer.getData(LIBRARY_DRAG_TYPE)
    if (!itemId) return
    event.preventDefault()
    addLibraryItem(itemId, toSlidePoint(event.clientX, event.clientY))
  }

  return (
    <SlideContext.Provider value={context}>
      <section
        ref={sectionRef}
        data-slide-root=""
        className={cn(`vx-${uid}`, animation.classes[ROOT_NODE])}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          containerType: "inline-size",
        }}
      >
        {animation.css ? <style>{animation.css}</style> : null}
        <div
          ref={(element) => {
            surfaceRef.current = element
            if (element) connect(element)
          }}
          data-slide-surface=""
          data-slide-canvas={editable ? "" : undefined}
          style={
            {
              position: "absolute",
              left: 0,
              top: 0,
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              overflow: "hidden",
              transformOrigin: "0 0",
              scale: `tan(atan2(100cqw, ${SLIDE_WIDTH}px))`,
              touchAction: "none",
              userSelect: "none",
              "--vx-zoom": scale,
            } as React.CSSProperties
          }
          onPointerDown={handleCanvasPointerDown}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <svg
            aria-hidden="true"
            width={SLIDE_WIDTH}
            height={SLIDE_HEIGHT}
            viewBox={`0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}`}
            style={{ position: "absolute", left: 0, top: 0, display: "block" }}
          >
            <defs>
              {backgroundType === "gradient" ? (
                gradientType === "radial" ? (
                  <radialGradient
                    id={GRADIENT_ID}
                    gradientUnits="userSpaceOnUse"
                    cx={SLIDE_WIDTH / 2}
                    cy={SLIDE_HEIGHT / 2}
                    r={Math.hypot(SLIDE_WIDTH, SLIDE_HEIGHT) / 2}
                  >
                    <stop offset="0" stopColor={gradientFrom} />
                    <stop offset="1" stopColor={gradientTo} />
                  </radialGradient>
                ) : (
                  <linearGradient
                    id={GRADIENT_ID}
                    gradientUnits="userSpaceOnUse"
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                  >
                    <stop offset="0" stopColor={gradientFrom} />
                    <stop offset="1" stopColor={gradientTo} />
                  </linearGradient>
                )
              ) : null}
              <pattern
                id={GRID_ID}
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M${gridSize} 0H0V${gridSize}`}
                  fill="none"
                  stroke="#737373"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </pattern>
            </defs>
            <rect
              width={SLIDE_WIDTH}
              height={SLIDE_HEIGHT}
              fill={
                backgroundType === "gradient"
                  ? `url(#${GRADIENT_ID})`
                  : background
              }
            />
            {backgroundType === "image" && backgroundImage ? (
              <image
                href={backgroundSrc}
                width={SLIDE_WIDTH}
                height={SLIDE_HEIGHT}
                preserveAspectRatio={
                  imageFit === "cover" ? "xMidYMid slice" : "xMidYMid meet"
                }
              />
            ) : null}
            {editable && showGrid ? (
              <rect
                width={SLIDE_WIDTH}
                height={SLIDE_HEIGHT}
                fill={`url(#${GRID_ID})`}
                data-export-ignore=""
                className="pointer-events-none"
              />
            ) : null}
          </svg>
          {children}
        </div>
        {editable ? (
          <svg
            data-export-ignore=""
            aria-hidden="true"
            viewBox={`0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            {editable && guides.length > 0 && (
              <g
                data-export-ignore=""
                aria-hidden="true"
                className="pointer-events-none stroke-primary"
              >
                {guides.map((guide) => (
                  <line
                    key={guide.axis}
                    x1={guide.axis === "x" ? guide.position : guide.start}
                    x2={guide.axis === "x" ? guide.position : guide.end}
                    y1={guide.axis === "y" ? guide.position : guide.start}
                    y2={guide.axis === "y" ? guide.position : guide.end}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            )}
            <SelectionOverlay />
            {marquee ? (
              <rect
                data-export-ignore=""
                aria-hidden="true"
                x={marquee.x}
                y={marquee.y}
                width={marquee.width}
                height={marquee.height}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="pointer-events-none fill-primary/10 stroke-primary"
              />
            ) : null}
          </svg>
        ) : null}
      </section>
    </SlideContext.Provider>
  )
}

Slide.craft = {
  displayName: "Slide",
  props: SLIDE_DEFAULTS,
  rules: { canDrag: () => false },
  related: { settings: SlideSettings },
}

export { Slide }
