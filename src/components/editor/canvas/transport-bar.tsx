import {
  Maximize2Icon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePlayback } from "../playback-context"
import { GridToggle } from "./grid-toggle"
import { TimeDisplay } from "./time-display"

export function TransportBar({
  zoom,
  onZoomChange,
  onFullscreen,
}: {
  zoom: string
  onZoomChange: (zoom: string) => void
  onFullscreen: () => void
}) {
  const { playing, loop, toggle, restart, skipToEnd, setLoop } = usePlayback()

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-t px-3">
      <div className="flex flex-1 items-center">
        <TimeDisplay />
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" onClick={restart}>
                <SkipBackIcon />
                <span className="sr-only">Restart</span>
              </Button>
            }
          />
          <TooltipContent>Restart</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="icon" onClick={toggle}>
                {playing ? <PauseIcon /> : <PlayIcon />}
                <span className="sr-only">
                  {playing ? "Pause animation" : "Play animation"}
                </span>
              </Button>
            }
          />
          <TooltipContent>
            {playing ? "Pause animation" : "Play animation"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" onClick={skipToEnd}>
                <SkipForwardIcon />
                <span className="sr-only">Skip to end</span>
              </Button>
            }
          />
          <TooltipContent>Skip to end</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <GridToggle />
        <Toggle
          size="sm"
          aria-label="Loop playback"
          pressed={loop}
          onPressedChange={setLoop}
        >
          <RepeatIcon />
        </Toggle>
        <Select
          value={zoom}
          onValueChange={(value) => onZoomChange(String(value))}
          items={{ fit: "Fit", "50": "50%", "100": "100%", "200": "200%" }}
        >
          <SelectTrigger size="sm" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="fit">Fit</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
              <SelectItem value="200">200%</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon-sm" onClick={onFullscreen}>
          <Maximize2Icon />
          <span className="sr-only">Fullscreen</span>
        </Button>
      </div>
    </div>
  )
}
