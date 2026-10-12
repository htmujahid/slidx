import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"

const SVG_NS = "http://www.w3.org/2000/svg"

const getCanvasSvg = () =>
  document.querySelector<SVGSVGElement>("svg[data-slide-canvas]")

export function svgToMarkup(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone
    .querySelectorAll("[data-export-ignore]")
    .forEach((node) => node.remove())
  clone.removeAttribute("class")
  clone.removeAttribute("style")
  clone.removeAttribute("data-slide-canvas")
  clone.setAttribute("xmlns", SVG_NS)
  clone.setAttribute("width", String(SLIDE_WIDTH))
  clone.setAttribute("height", String(SLIDE_HEIGHT))

  const fonts = getComputedStyle(document.documentElement)
  let markup = new XMLSerializer().serializeToString(clone)
  for (const name of ["--font-sans", "--font-mono"]) {
    const value = fonts.getPropertyValue(name).trim().replaceAll('"', "'")
    if (value) markup = markup.replaceAll(`var(${name})`, value)
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`
}

export function slideToSvg() {
  const svg = getCanvasSvg()
  return svg ? svgToMarkup(svg) : null
}

export const svgToBlob = (markup: string) =>
  new Blob([markup], { type: "image/svg+xml;charset=utf-8" })

export function svgToPng(markup: string, scale = 1) {
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = SLIDE_WIDTH * scale
        canvas.height = SLIDE_HEIGHT * scale
        const context = canvas.getContext("2d")
        if (!context) throw new Error("Canvas is not available.")
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not create the PNG.")),
          "image/png"
        )
      } catch (error) {
        reject(error)
      }
    }
    image.onerror = () => reject(new Error("Could not render the slide."))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  })
}
