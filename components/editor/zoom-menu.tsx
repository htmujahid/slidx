"use client"

import * as React from "react"

import { ZOOM_MAX, ZOOM_MIN } from "@/lib/editor/constants"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useEditorLayout,
  type FitMode,
} from "@/components/editor/editor-layout"

const subscribe = () => () => {}
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform)

/** The shortcut's modifier key as this platform calls it. */
const useModifier = () =>
  React.useSyncExternalStore(subscribe, isMac, () => false) ? "⌘" : "Ctrl+"

/** Sizes to jump to, as a percentage of the slide's own size. */
const PRESETS = [25, 50, 75, 100, 150, 200]

/** The footer's zoom readout, which opens the zoom options. */
function ZoomMenu() {
  const {
    canvasScale,
    zoom,
    fitMode,
    fit,
    zoomIn,
    zoomOut,
    zoomToScale,
    canZoomToScale,
  } = useEditorLayout()
  const percent = Math.round(canvasScale * 100)
  const mod = useModifier()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="xs"
            aria-label={`Zoom, ${percent}%`}
            className="gap-1.5 font-normal text-muted-foreground"
          />
        }
      >
        <span className="text-muted-foreground/70">Zoom</span>
        <span className="tabular-nums">{percent}%</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={zoom >= ZOOM_MAX} onClick={zoomIn}>
            Zoom in
            <DropdownMenuShortcut>{mod}=</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={zoom <= ZOOM_MIN} onClick={zoomOut}>
            Zoom out
            <DropdownMenuShortcut>{mod}-</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Fit</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={zoom === 1 ? fitMode : ""}
            onValueChange={(value) => fit(value as FitMode)}
          >
            <DropdownMenuRadioItem value="view" closeOnClick>
              Fit to view
              <DropdownMenuShortcut>{mod}0</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="width" closeOnClick>
              Fit to width
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Zoom to</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={PRESETS.includes(percent) ? String(percent) : ""}
            onValueChange={(value) => zoomToScale(Number(value) / 100)}
          >
            {PRESETS.map((preset) => (
              <DropdownMenuRadioItem
                key={preset}
                value={String(preset)}
                disabled={!canZoomToScale(preset / 100)}
                closeOnClick
              >
                {preset}%
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ZoomMenu }
