import {
  formatTime,
  usePlayback,
  usePlaybackTime,
} from "../playback-context"

export function TimeDisplay() {
  const time = usePlaybackTime()
  const { duration } = usePlayback()
  return (
    <span className="font-mono text-xs tabular-nums">
      {formatTime(time)}
      <span className="text-muted-foreground"> / {formatTime(duration)}</span>
    </span>
  )
}
