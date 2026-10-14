const DRAWN_ELEMENTS = "path,rect,circle,ellipse,line,polygon,polyline"

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

export function measureTextExtent(wrapper: HTMLElement) {
  const box = wrapper.getBoundingClientRect()
  const scale = wrapper.offsetWidth ? box.width / wrapper.offsetWidth : 0
  if (!scale) return

  const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_TEXT)
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
  if (left === Infinity) return

  wrapper.style.setProperty("--vx-text-l", `${(left - box.left) / scale}px`)
  wrapper.style.setProperty(
    "--vx-text-r",
    `${(right - box.left) / scale + 2}px`
  )
}
