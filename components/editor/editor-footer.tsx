"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import { getElementLabel } from "@/lib/editor/labels"
import { SLIDE_DEFAULTS, type SlideProps } from "@/lib/editor/slide-props"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { useSlides } from "@/components/editor/slides-context"

type Transform = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

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

function EditorFooter() {
  const { activeIndex, slides, selectSlide } = useSlides()
  const { canvasScale } = useEditorLayout()
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
      className="flex h-(--footer-height) shrink-0 items-center gap-3 overflow-x-auto border-t bg-background px-3 text-xs text-muted-foreground"
    >
      <div className="-ml-1.5 flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Previous slide"
          disabled={activeIndex === 0}
          onClick={() => selectSlide(slides[activeIndex - 1].id)}
        >
          <ChevronLeftIcon />
        </Button>
        <Stat>
          Slide {activeIndex + 1} of {slides.length}
        </Stat>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Next slide"
          disabled={activeIndex === slides.length - 1}
          onClick={() => selectSlide(slides[activeIndex + 1].id)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
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
        <span>No selection</span>
      )}

      <div className="ml-auto flex items-center gap-3">
        {slide.showGrid || slide.snapToGrid ? (
          <>
            <Stat label="Grid">
              {slide.gridSize}
              {slide.snapToGrid ? " · snap" : ""}
            </Stat>
            <FooterSeparator />
          </>
        ) : null}
        <span className="hidden sm:block">
          <Stat>
            16:9 · {SLIDE_WIDTH} × {SLIDE_HEIGHT}
          </Stat>
        </span>
        <FooterSeparator />
        <Stat label="Zoom">{Math.round(canvasScale * 100)}%</Stat>
      </div>
    </footer>
  )
}

export { EditorFooter }
