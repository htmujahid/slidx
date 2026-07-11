import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { TIMELINE_DURATION } from "./data"
import {
  PlaybackContext,
  PlaybackTimeContext,
  type PlaybackControls,
} from "./playback-context"

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const timeRef = useRef(0)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [duration, setDuration] = useState(TIMELINE_DURATION)

  const durationRef = useRef(duration)
  const loopRef = useRef(loop)
  const playingRef = useRef(playing)
  useEffect(() => {
    durationRef.current = duration
    loopRef.current = loop
    playingRef.current = playing
  }, [duration, loop, playing])

  const registerSvg = useCallback((svg: SVGSVGElement | null) => {
    if (svg === svgRef.current) return
    svgRef.current = svg
    if (svg) {
      svg.setCurrentTime(timeRef.current)
      if (playingRef.current) {
        svg.unpauseAnimations()
      } else {
        svg.pauseAnimations()
      }
    }
  }, [])

  const seek = useCallback((next: number) => {
    const clamped = Math.max(0, next)
    timeRef.current = clamped
    svgRef.current?.setCurrentTime(clamped)
    setTime(clamped)
  }, [])

  const play = useCallback(() => {
    if (timeRef.current >= durationRef.current) seek(0)
    svgRef.current?.unpauseAnimations()
    setPlaying(true)
  }, [seek])

  const pause = useCallback(() => {
    svgRef.current?.pauseAnimations()
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing) return
    let frame: number
    const tick = () => {
      const svg = svgRef.current
      if (svg) {
        let current = svg.getCurrentTime()
        if (current >= durationRef.current) {
          if (loopRef.current) {
            svg.setCurrentTime(0)
            current = 0
          } else {
            svg.pauseAnimations()
            svg.setCurrentTime(durationRef.current)
            timeRef.current = durationRef.current
            setTime(durationRef.current)
            setPlaying(false)
            return
          }
        }
        timeRef.current = current
        setTime(current)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const controls = useMemo<PlaybackControls>(
    () => ({
      playing,
      loop,
      duration,
      registerSvg,
      play,
      pause,
      toggle: () => (playing ? pause() : play()),
      seek,
      restart: () => seek(0),
      skipToEnd: () => {
        pause()
        seek(durationRef.current)
      },
      setLoop,
      setDuration: (seconds: number) => setDuration(Math.max(1, seconds)),
    }),
    [playing, loop, duration, registerSvg, play, pause, seek]
  )

  return (
    <PlaybackContext.Provider value={controls}>
      <PlaybackTimeContext.Provider value={time}>
        {children}
      </PlaybackTimeContext.Provider>
    </PlaybackContext.Provider>
  )
}
