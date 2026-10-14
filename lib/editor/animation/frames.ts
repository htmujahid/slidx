export const DISTANCE = 160

export const slideFrames = (axis: "X" | "Y", sign: 1 | -1) =>
  `from{opacity:0;transform:translate${axis}(${sign * DISTANCE}px)}to{opacity:1;transform:none}`

export const slideOutFrames = (axis: "X" | "Y", sign: 1 | -1) =>
  `from{opacity:1;transform:none}to{opacity:0;transform:translate${axis}(${sign * DISTANCE}px)}`

export const WIPE_FRAMES =
  "from{clip-path:inset(-200px 100% -200px -200px)}to{clip-path:inset(-200px -200px -200px -200px)}"

export const WIPE_OUT_FRAMES =
  "from{clip-path:inset(-200px -200px -200px -200px)}to{clip-path:inset(-200px -200px -200px 100%)}"

export const TYPEWRITER_FRAMES =
  "from{clip-path:inset(-200px calc(100% - var(--vx-text-l,0px)) -200px -200px)}99.9%{clip-path:inset(-200px calc(100% - var(--vx-text-r,100%)) -200px -200px)}to{clip-path:inset(-200px -200px -200px -200px)}"

export const DRAW_STROKE_FRAMES =
  "from{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:var(--vx-len)}to{stroke-dasharray:var(--vx-len) calc(var(--vx-len)*2);stroke-dashoffset:0}"

export const DRAW_FILL_FRAMES = "0%,55%{fill-opacity:0}100%{fill-opacity:1}"

export const FADE_LATE_FRAMES = "0%,60%{opacity:0}to{opacity:1}"
