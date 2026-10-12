"use client"

import * as React from "react"
import { Editor, Frame } from "@craftjs/core"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  XIcon,
} from "lucide-react"

import { SLIDE_ASPECT_RATIO } from "@/lib/editor/constants"
import type { PresentationFile } from "@/lib/editor/presentation"
import { resolver } from "@/lib/editor/resolver"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { useSlides } from "@/components/editor/slides-context"

const PresentationContext = React.createContext<{
  presenting: boolean
  start: (trigger?: HTMLElement) => void
} | null>(null)

function PresentationControl({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function PresentationProvider({ children }: { children: React.ReactNode }) {
  const { getPresentation, activeIndex } = useSlides()
  const { setEditingId } = useEditorLayout()
  const [deck, setDeck] = React.useState<PresentationFile | null>(null)
  const [index, setIndex] = React.useState(0)
  const [fullscreen, setFullscreen] = React.useState(false)
  const ownsFullscreen = React.useRef(false)
  const requestedFullscreen = React.useRef(false)
  const returnFocus = React.useRef<HTMLElement | null>(null)
  const active = React.useRef(false)

  const enterFullscreen = React.useCallback(() => {
    if (
      document.fullscreenElement ||
      !document.documentElement.requestFullscreen
    )
      return
    requestedFullscreen.current = true
    void document.documentElement
      .requestFullscreen()
      .then(() => {
        if (
          !active.current &&
          document.fullscreenElement === document.documentElement
        ) {
          ownsFullscreen.current = false
          requestedFullscreen.current = false
          void document.exitFullscreen().catch(() => {})
        }
      })
      .catch(() => {
        requestedFullscreen.current = false
      })
  }, [])

  const stop = React.useCallback(() => {
    active.current = false
    setDeck(null)
    if (
      ownsFullscreen.current &&
      document.fullscreenElement === document.documentElement
    ) {
      ownsFullscreen.current = false
      requestedFullscreen.current = false
      void document.exitFullscreen().catch(() => {})
    }
  }, [])

  React.useEffect(() => {
    const onFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement === document.documentElement
      setFullscreen(isFullscreen)
      if (isFullscreen && requestedFullscreen.current)
        ownsFullscreen.current = true
      else if (!document.fullscreenElement && ownsFullscreen.current) {
        ownsFullscreen.current = false
        requestedFullscreen.current = false
        active.current = false
        setDeck(null)
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      active.current = false
      if (
        ownsFullscreen.current &&
        document.fullscreenElement === document.documentElement
      )
        void document.exitFullscreen().catch(() => {})
    }
  }, [])

  const start = React.useCallback(
    (trigger?: HTMLElement) => {
      if (active.current) return
      const snapshot = getPresentation()
      returnFocus.current =
        trigger ??
        (document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null)
      setEditingId(null)
      setDeck(snapshot)
      setIndex(activeIndex)
      active.current = true
      enterFullscreen()
    },
    [getPresentation, activeIndex, setEditingId, enterFullscreen]
  )
  const context = React.useMemo(
    () => ({ presenting: !!deck, start }),
    [deck, start]
  )
  const go = (delta: number) =>
    setIndex((current) =>
      Math.max(0, Math.min((deck?.slides.length ?? 1) - 1, current + delta))
    )

  return (
    <PresentationContext.Provider value={context}>
      {children}
      <Dialog
        open={!!deck}
        onOpenChange={(open) => {
          if (!open) stop()
        }}
      >
        <DialogContent
          showCloseButton={false}
          finalFocus={returnFocus}
          className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:max-w-none"
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Escape") {
              event.preventDefault()
              stop()
              return
            }
            if (event.altKey || event.ctrlKey || event.metaKey) return
            if (
              event.target instanceof Element &&
              event.target.closest("button") &&
              [" ", "Enter"].includes(event.key)
            )
              return
            if (
              ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(
                event.key
              )
            ) {
              event.preventDefault()
              go(event.shiftKey && event.key === " " ? -1 : 1)
            } else if (
              ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(
                event.key
              )
            ) {
              event.preventDefault()
              go(-1)
            } else if (event.key === "Home") {
              event.preventDefault()
              setIndex(0)
            } else if (event.key === "End") {
              event.preventDefault()
              setIndex((deck?.slides.length ?? 1) - 1)
            }
          }}
        >
          <DialogTitle className="sr-only">
            {deck?.title ?? "Presentation"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Use arrow keys or Space to navigate slides, Home and End to jump,
            and Escape to exit.
          </DialogDescription>
          {deck && (
            <>
              <div
                className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4"
                onClick={() => go(1)}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div
                  className="pointer-events-none w-full"
                  style={{
                    aspectRatio: SLIDE_ASPECT_RATIO,
                    maxWidth: `calc((100dvh - 6rem) * ${SLIDE_ASPECT_RATIO})`,
                  }}
                >
                  <Editor key={index} resolver={resolver} enabled={false}>
                    <Frame data={deck.slides[index].json} />
                  </Editor>
                </div>
              </div>
              <div className="flex h-14 shrink-0 items-center gap-2 border-t px-4">
                <span className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
                  {deck.title}
                </span>
                <div className="flex items-center gap-2 sm:justify-center">
                  <PresentationControl
                    label="Previous slide"
                    disabled={index === 0}
                    onClick={() => go(-1)}
                  >
                    <ChevronLeftIcon />
                  </PresentationControl>
                  <span
                    aria-live="polite"
                    aria-atomic="true"
                    className="min-w-20 text-center text-sm tabular-nums"
                  >
                    {index + 1} / {deck.slides.length}
                  </span>
                  <PresentationControl
                    label="Next slide"
                    disabled={index === deck.slides.length - 1}
                    onClick={() => go(1)}
                  >
                    <ChevronRightIcon />
                  </PresentationControl>
                </div>
                <div className="ml-auto flex items-center gap-2 sm:flex-1 sm:justify-end">
                  <span className="hidden text-xs text-muted-foreground lg:block">
                    ← → Navigate · Esc Exit
                  </span>
                  {!fullscreen && (
                    <PresentationControl
                      label="Enter fullscreen"
                      onClick={enterFullscreen}
                    >
                      <MaximizeIcon />
                    </PresentationControl>
                  )}
                  <PresentationControl label="Exit presentation" onClick={stop}>
                    <XIcon />
                  </PresentationControl>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PresentationContext.Provider>
  )
}

function usePresentation() {
  const context = React.useContext(PresentationContext)
  if (!context)
    throw new Error("usePresentation must be used within PresentationProvider.")
  return context
}

export { PresentationProvider, usePresentation }
