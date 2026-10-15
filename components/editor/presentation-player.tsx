"use client"

import * as React from "react"
import { Editor, Frame } from "@craftjs/core"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  XIcon,
} from "lucide-react"

import { createFullscreen } from "@/lib/editor/fullscreen"
import { resolver } from "@/lib/editor/resolver"
import { slideSizeFromJson } from "@/lib/editor/slide-size"
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
import { PlaybackProvider } from "@/components/editor/animation-playback"
import { usePresenter } from "@/components/editor/editor-stores"

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

function PresentationPlayer() {
  const deck = usePresenter((state) => state.deck)
  const index = usePresenter((state) => state.index)
  const stop = usePresenter((state) => state.stop)
  const go = usePresenter((state) => state.go)
  const goTo = usePresenter((state) => state.goTo)
  const [fullscreen, setFullscreen] = React.useState(false)
  const returnFocus = usePresenter((state) => state.returnFocus)
  const controller = React.useRef<ReturnType<typeof createFullscreen> | null>(
    null
  )
  const presenting = deck !== null
  const wanted = React.useRef(presenting)

  React.useEffect(() => {
    wanted.current = presenting
  }, [presenting])

  React.useEffect(() => {
    const fs = createFullscreen({
      isWanted: () => wanted.current,
      onChange: setFullscreen,
      onExternalExit: stop,
    })
    controller.current = fs
    const detach = fs.attach()
    return () => {
      detach()
      controller.current = null
    }
  }, [stop])

  React.useEffect(() => {
    if (presenting) controller.current?.enter()
    else controller.current?.exit()
  }, [presenting])

  const size = deck ? slideSizeFromJson(deck.slides[index].json) : null
  const ratio = size ? size.width / size.height : 16 / 9

  return (
    <Dialog
      open={!!deck}
      onOpenChange={(open) => {
        if (!open) stop()
      }}
    >
      <DialogContent
        showCloseButton={false}
        finalFocus={() => returnFocus}
        className="top-0 left-0 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:max-w-none"
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
            ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(event.key)
          ) {
            event.preventDefault()
            go(-1)
          } else if (event.key === "Home") {
            event.preventDefault()
            goTo(0)
          } else if (event.key === "End") {
            event.preventDefault()
            goTo((deck?.slides.length ?? 1) - 1)
          }
        }}
      >
        <DialogTitle className="sr-only">
          {deck?.title ?? "Presentation"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Use arrow keys or Space to navigate slides, Home and End to jump, and
          Escape to exit.
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
                  aspectRatio: ratio,
                  maxWidth: `calc((100dvh - 6rem) * ${ratio})`,
                }}
              >
                <PlaybackProvider>
                  <Editor key={index} resolver={resolver} enabled={false}>
                    <Frame data={deck.slides[index].json} />
                  </Editor>
                </PlaybackProvider>
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
                    onClick={() => controller.current?.enter()}
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
  )
}

export { PresentationPlayer }
