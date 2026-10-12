const DRAWN_ELEMENTS = "path,rect,circle,ellipse,line,polygon,polyline"

/**
 * Stores each outline's true length as `--vx-len`, which the draw-on
 * keyframes read, so playback itself needs no script.
 */
export function measureDrawLengths(root: Element) {
  root
    .querySelectorAll<SVGGeometryElement>(DRAWN_ELEMENTS)
    .forEach((element) => {
      if (typeof element.getTotalLength !== "function") return
      element.style.setProperty(
        "--vx-len",
        String(Math.ceil(element.getTotalLength() * 100) / 100)
      )
    })
}

/**
 * Stores where the text starts and ends inside its box as `--vx-text-l` and
 * `--vx-text-r` (user units), so the typewriter reveals the text rather than
 * the whole box. Left unset, the reveal falls back to sweeping the box.
 */
export function measureTextExtent(wrapper: SVGGElement) {
  const box = wrapper.querySelector("foreignObject")
  const matrix = box?.getScreenCTM()
  if (!box || !matrix) return

  const scale = Math.hypot(matrix.a, matrix.b)
  const origin = box.getBoundingClientRect().left
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
  let left = Infinity
  let right = -Infinity
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue
    const range = document.createRange()
    range.selectNodeContents(node)
    const rect = range.getBoundingClientRect()
    if (rect.width === 0) continue
    left = Math.min(left, rect.left)
    right = Math.max(right, rect.right)
  }
  if (!scale || left === Infinity) return

  wrapper.style.setProperty("--vx-text-l", `${(left - origin) / scale}px`)
  wrapper.style.setProperty("--vx-text-r", `${(right - origin) / scale + 2}px`)
}
