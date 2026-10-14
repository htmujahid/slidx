"use client"

import * as React from "react"
import { useShallow } from "zustand/react/shallow"

import { ZOOM_MAX, ZOOM_MIN } from "@/lib/editor/constants"
import {
  canZoomToScale,
  type FitMode,
} from "@/lib/editor/stores/viewport-store"
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
import { useViewport } from "@/components/editor/editor-stores"

const subscribe = () => () => {}
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform)

const useModifier = () =>
  React.useSyncExternalStore(subscribe, isMac, () => false) ? "⌘" : "Ctrl+"

const PRESETS = [25, 50, 75, 100, 150, 200]

function ZoomMenu() {
  const viewport = useViewport(
    useShallow(({ canvasScale, zoom }) => ({ canvasScale, zoom }))
  )
  const { canvasScale, zoom } = viewport
  const fitMode = useViewport((state) => state.fitMode)
  const fit = useViewport((state) => state.fit)
  const zoomIn = useViewport((state) => state.zoomIn)
  const zoomOut = useViewport((state) => state.zoomOut)
  const zoomToScale = useViewport((state) => state.zoomToScale)
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
                disabled={!canZoomToScale(viewport, preset / 100)}
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
