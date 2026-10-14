export function createFullscreen({
  isWanted,
  onChange,
  onExternalExit,
}: {
  isWanted: () => boolean
  onChange: (fullscreen: boolean) => void
  onExternalExit: () => void
}) {
  let owns = false
  let requested = false

  const isRoot = () => document.fullscreenElement === document.documentElement

  const release = () => {
    owns = false
    requested = false
    void document.exitFullscreen().catch(() => {})
  }

  const enter = () => {
    if (
      document.fullscreenElement ||
      !document.documentElement.requestFullscreen
    )
      return
    requested = true
    void document.documentElement
      .requestFullscreen()
      .then(() => {
        if (!isWanted() && isRoot()) release()
      })
      .catch(() => {
        requested = false
      })
  }

  const exit = () => {
    if (owns && isRoot()) release()
  }

  const attach = () => {
    const onFullscreenChange = () => {
      const fullscreen = isRoot()
      onChange(fullscreen)
      if (fullscreen && requested) owns = true
      else if (!document.fullscreenElement && owns) {
        owns = false
        requested = false
        onExternalExit()
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      exit()
    }
  }

  return { enter, exit, attach }
}
