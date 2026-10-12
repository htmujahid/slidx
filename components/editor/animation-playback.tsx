"use client"

import * as React from "react"

type Playback = {
  /** Whether slides play their animations (Present mode, HTML export). */
  play: boolean
  /** Changes to restart a slide's animations. */
  run: number
}

const PlaybackContext = React.createContext<Playback>({ play: false, run: 0 })

function PlaybackProvider({
  play = true,
  run = 0,
  children,
}: Partial<Playback> & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ play, run }), [play, run])
  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  )
}

const usePlayback = () => React.useContext(PlaybackContext)

export { PlaybackProvider, usePlayback }
