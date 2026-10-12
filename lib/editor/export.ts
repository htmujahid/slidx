import { embeddedFontCss } from "@/lib/editor/fonts"
import { slideSizeOf, type SlideSize } from "@/lib/editor/slide-size"

/** The slide being edited, as the section that holds it. */
const getCanvasSection = () =>
  document
    .querySelector<HTMLElement>("[data-slide-canvas]")
    ?.closest<HTMLElement>("[data-slide-root]") ?? null

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

/** The slide's own size: the layout size of its surface, before it is scaled to fit. */
function sectionSize(section: HTMLElement): SlideSize {
  const surface = section.querySelector<HTMLElement>("[data-slide-surface]")
  return slideSizeOf({
    width: surface?.offsetWidth,
    height: surface?.offsetHeight,
  })
}

/**
 * A copy of the slide without editor-only chrome and without its playback:
 * what is left is the slide at rest.
 */
function cleanSlideClone(section: HTMLElement) {
  const clone = section.cloneNode(true) as HTMLElement
  clone
    .querySelectorAll("[data-export-ignore]")
    .forEach((node) => node.remove())
  clone.querySelectorAll("[data-editor-node]").forEach((node) => {
    node.removeAttribute("data-editor-node")
  })
  clone
    .querySelector("[data-slide-canvas]")
    ?.removeAttribute("data-slide-canvas")
  return clone
}

/**
 * The slide as a fragment to inline in an HTML page. It keeps its animation
 * CSS and classes, and is scaled to its frame by CSS alone.
 */
export function sectionToHtml(section: HTMLElement) {
  const clone = cleanSlideClone(section)
  clone
    .querySelector<HTMLElement>("[data-slide-surface]")
    ?.style.removeProperty("--vx-zoom")
  return resolveFontVars(clone.outerHTML)
}

const escapeCss = (css: string) =>
  css.replaceAll("&", "&amp;").replaceAll("<", "&lt;")

/**
 * The slide as an image-ready `<svg>`: the slide at its own size, as HTML in a
 * single `foreignObject`, with its fonts embedded. Playback is stripped, so
 * it shows the slide at rest.
 */
export async function sectionToImageMarkup(section: HTMLElement) {
  const size = sectionSize(section)
  const clone = cleanSlideClone(section)
  // The slide is drawn at its own size here, so there is nothing to scale.
  clone.removeAttribute("class")
  clone.style.cssText = `position:relative;width:${size.width}px;height:${size.height}px;overflow:hidden`
  const surface = clone.querySelector<HTMLElement>("[data-slide-surface]")
  if (surface) {
    surface.style.scale = "none"
    surface.style.removeProperty("--vx-zoom")
  }
  clone.querySelectorAll("style").forEach((style) => {
    if (style.textContent?.includes("@keyframes")) style.remove()
  })
  clone.querySelectorAll("[class]").forEach((node) => {
    node.setAttribute(
      "class",
      (node.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((name) => !name.startsWith("a-"))
        .join(" ")
    )
  })

  const html = resolveFontVars(new XMLSerializer().serializeToString(clone))
  const fonts = await embeddedFontCss(html)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}"><foreignObject width="${size.width}" height="${size.height}"><style xmlns="http://www.w3.org/1999/xhtml">${escapeCss(fonts)}</style>${html}</foreignObject></svg>`
}

/** The size of slide markup made by `sectionToImageMarkup`. */
export const markupSize = (markup: string): SlideSize => {
  const [, width, height] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(markup) ?? []
  return slideSizeOf({ width: Number(width), height: Number(height) })
}

/** The slide being edited, ready to be drawn into an image. */
export async function slideToImageMarkup() {
  const section = getCanvasSection()
  return section ? sectionToImageMarkup(section) : null
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
