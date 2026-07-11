import { createContext, useContext } from "react"

export type PlaybackControls = {
  playing: boolean
  loop: boolean
  duration: number
  registerSvg: (svg: SVGSVGElement | null) => void
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  restart: () => void
  skipToEnd: () => void
  setLoop: (loop: boolean) => void
  setDuration: (seconds: number) => void
}

export const PlaybackContext = createContext<PlaybackControls | null>(null)
export const PlaybackTimeContext = createContext(0)

export function usePlayback() {
  const context = useContext(PlaybackContext)
  if (!context) {
    throw new Error("usePlayback must be used within PlaybackProvider")
  }
  return context
}

export function usePlaybackTime() {
  return useContext(PlaybackTimeContext)
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${String(secs).padStart(2, "0")}`
}
