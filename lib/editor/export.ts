import { slideSizeOf, type SlideSize } from "@/lib/editor/slide-size"

const SVG_NS = "http://www.w3.org/2000/svg"

const getCanvasSvg = () =>
  document.querySelector<SVGSVGElement>("svg[data-slide-canvas]")

/** Resolves the app's font variables to concrete families for standalone files. */
function resolveFontVars(markup: string) {
  const fonts = getComputedStyle(document.documentElement)
  let result = markup
  for (const name of ["--font-sans", "--font-mono"]) {
    const value = fonts.getPropertyValue(name).trim().replaceAll('"', "'")
    if (value) result = result.replaceAll(`var(${name})`, value)
  }
  return result
}

/** A copy of the slide without any editor-only chrome. */
function cleanSlideClone(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone
    .querySelectorAll("[data-export-ignore]")
    .forEach((node) => node.remove())
  clone.removeAttribute("class")
  clone.removeAttribute("style")
  clone.removeAttribute("data-slide-canvas")
  return clone
}

/** A slide svg's size, from its viewBox. */
export const svgSize = (svg: SVGSVGElement): SlideSize =>
  slideSizeOf({
    width: svg.viewBox.baseVal.width,
    height: svg.viewBox.baseVal.height,
  })

/** The size of slide markup made by `svgToMarkup`. */
export const markupSize = (markup: string): SlideSize => {
  const [, width, height] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(markup) ?? []
  return slideSizeOf({ width: Number(width), height: Number(height) })
}

export function svgToMarkup(svg: SVGSVGElement) {
  const clone = cleanSlideClone(svg)
  const { width, height } = svgSize(svg)
  clone.setAttribute("xmlns", SVG_NS)
  clone.setAttribute("width", String(width))
  clone.setAttribute("height", String(height))
  const markup = resolveFontVars(new XMLSerializer().serializeToString(clone))
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`
}

/** The slide as a fragment to inline in an HTML page; sized by CSS. */
export function svgToHtml(svg: SVGSVGElement) {
  const clone = cleanSlideClone(svg)
  clone.removeAttribute("width")
  clone.removeAttribute("height")
  // The slide's section carries its own entrance and exit, so it goes along.
  const section = svg.closest("[data-slide-root]")
  if (!section) return resolveFontVars(clone.outerHTML)
  const wrapper = section.cloneNode(false) as HTMLElement
  wrapper.removeAttribute("data-slide-root")
  wrapper.setAttribute("class", section.getAttribute("class") ?? "")
  wrapper.append(clone)
  return resolveFontVars(wrapper.outerHTML)
}

export function slideToSvg() {
  const svg = getCanvasSvg()
  return svg ? svgToMarkup(svg) : null
}

export function svgToPng(markup: string, scale = 1) {
  const size = markupSize(markup)
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = size.width * scale
        canvas.height = size.height * scale
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
