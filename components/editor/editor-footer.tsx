"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import { ChartGanttIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { getElementLabel } from "@/lib/editor/labels"
import { SLIDE_DEFAULTS, type SlideProps } from "@/lib/editor/slide-props"
import { aspectLabel } from "@/lib/editor/slide-size"
import { useChrome } from "@/lib/editor/stores/chrome-store"
import { useSlideSize } from "@/hooks/use-slide-size"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { selectActiveIndex, useDeck } from "@/components/editor/editor-stores"
import { ZoomMenu } from "@/components/editor/zoom-menu"

function Stat({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      {label ? <span className="text-muted-foreground/70">{label}</span> : null}
      <span className="tabular-nums">{children}</span>
    </span>
  )
}

function FooterSeparator() {
  return <Separator orientation="vertical" className="h-3.5 self-center!" />
}

type Transform = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

function EditorFooter() {
  const activeIndex = useDeck(selectActiveIndex)
  const slideIds = useDeck(useShallow((state) => state.slides.map((s) => s.id)))
  const selectSlide = useDeck((state) => state.select)
  const timelineOpen = useChrome((state) => state.timelineOpen)
  const toggleTimeline = useChrome((state) => state.toggleTimeline)
  const setDialog = useChrome((state) => state.setDialog)
  const size = useSlideSize()
  const { selected, count, slide } = useEditor((state) => {
    const [id] = state.events.selected
    const node = id && id !== ROOT_NODE ? state.nodes[id] : undefined
    const root = state.nodes[ROOT_NODE]
    return {
      selected: node
        ? {
            label: getElementLabel({
              name: node.data.name,
              props: node.data.props,
            }),
            transform: node.data.props as Transform,
          }
        : undefined,
      count: root?.data.nodes.length ?? 0,
      slide: { ...SLIDE_DEFAULTS, ...root?.data.props } as SlideProps,
    }
  })

  return (
    <footer
      aria-label="Status"
      className="flex h-(--footer-height) shrink-0 items-center gap-2 overflow-x-auto border-t bg-background px-3 text-xs text-muted-foreground sm:gap-3"
    >
      <div className="-ml-1.5 flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Previous slide"
          disabled={activeIndex === 0}
          onClick={() => selectSlide(slideIds[activeIndex - 1])}
        >
          <ChevronLeftIcon />
        </Button>
        <Stat>
          Slide {activeIndex + 1} of {slideIds.length}
        </Stat>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Next slide"
          disabled={activeIndex === slideIds.length - 1}
          onClick={() => selectSlide(slideIds[activeIndex + 1])}
        >
          <ChevronRightIcon />
        </Button>
      </div>
      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <FooterSeparator />
        <Stat>
          {count} {count === 1 ? "element" : "elements"}
        </Stat>
        <FooterSeparator />
        {selected ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="max-w-40 truncate font-medium text-foreground">
              {selected.label}
            </span>
            <Stat>
              {Math.round(selected.transform.width)} ×{" "}
              {Math.round(selected.transform.height)}
            </Stat>
            <span className="hidden items-center gap-3 lg:flex">
              <Stat label="at">
                {Math.round(selected.transform.x)},{" "}
                {Math.round(selected.transform.y)}
              </Stat>
              {selected.transform.rotation ? (
                <Stat>{Math.round(selected.transform.rotation)}°</Stat>
              ) : null}
            </span>
          </div>
        ) : (
          <span className="whitespace-nowrap">No selection</span>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {slide.showGrid || slide.snapToGrid ? (
          <>
            <Stat label="Grid">
              {slide.gridSize}
              {slide.snapToGrid ? " · snap" : ""}
            </Stat>
            <FooterSeparator />
          </>
        ) : null}
        <Button
          variant="ghost"
          size="xs"
          aria-pressed={timelineOpen}
          className={timelineOpen ? "bg-muted text-foreground" : undefined}
          onClick={toggleTimeline}
        >
          <ChartGanttIcon data-icon="inline-start" />
          Timeline
        </Button>
        <FooterSeparator />
        <Button
          variant="ghost"
          size="xs"
          className="hidden font-normal text-muted-foreground sm:inline-flex"
          aria-label={`Slide size, ${aspectLabel(size)}, ${size.width} by ${size.height}`}
          onClick={() => setDialog("size")}
        >
          <span className="tabular-nums">
            {aspectLabel(size)} · {size.width} × {size.height}
          </span>
        </Button>
        <FooterSeparator />
        <ZoomMenu />
      </div>
    </footer>
  )
}

export { EditorFooter }
