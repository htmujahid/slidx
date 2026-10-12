import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import { svgToHtml } from "@/lib/editor/export"
import { renderSlides } from "@/lib/editor/render-slides"

const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

function readAsDataUri(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function fetchAsDataUri(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load ${url}`)
  return readAsDataUri(await response.blob())
}

/** Every character the slides display, as code points. */
function usedCodePoints(markup: string) {
  const template = document.createElement("template")
  template.innerHTML = markup
  const points = new Set<number>()
  for (const char of template.content.textContent ?? "") {
    points.add(char.codePointAt(0) as number)
  }
  return points
}

/** Whether a `unicode-range` descriptor covers any of the given code points. */
function coversAny(range: string, points: Set<number>) {
  if (!range.trim()) return true
  return range.split(",").some((token) => {
    const [from, to = from] = token.trim().replace(/^U\+/i, "").split("-")
    const start = parseInt(from.replaceAll("?", "0"), 16)
    const end = parseInt(to.replaceAll("?", "F"), 16)
    for (const point of points) if (point >= start && point <= end) return true
    return false
  })
}

/**
 * `@font-face` rules for the families the deck uses, with their font files
 * inlined as data URIs so the exported file needs nothing else.
 */
async function embeddedFontCss(markup: string) {
  const rules: CSSFontFaceRule[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let list: CSSRuleList
    try {
      list = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSFontFaceRule) rules.push(rule)
    }
  }

  const points = usedCodePoints(markup)
  const used = rules.filter((rule) => {
    const family = rule.style
      .getPropertyValue("font-family")
      .replace(/["']/g, "")
      .trim()
    return (
      family &&
      markup.includes(family) &&
      coversAny(rule.style.getPropertyValue("unicode-range"), points)
    )
  })

  const css = await Promise.all(
    used.map(async (rule) => {
      const urls = [...rule.cssText.matchAll(/url\((["']?)(.*?)\1\)/g)]
      let text = rule.cssText
      for (const [whole, , url] of urls) {
        if (url.startsWith("data:")) continue
        try {
          const base = rule.parentStyleSheet?.href ?? document.baseURI
          const dataUri = await fetchAsDataUri(new URL(url, base).href)
          text = text.replace(whole, `url("${dataUri}")`)
        } catch {
          // The family falls back to its next source or a system font.
        }
      }
      return text
    })
  )
  return css.join("\n")
}

const DECK_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{background:#0a0a0a;color-scheme:dark}
body{margin:0;min-height:100dvh;color:#fafafa;font:14px/1.4 var(--deck-font);-webkit-font-smoothing:antialiased}
a{color:inherit}
i[id]{position:absolute;width:0;height:0}

.slide{display:none;position:relative;min-height:100dvh;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px}
.slide:target,.deck:not(:has(.slide:target)) .slide:first-child{display:flex}
.frame{position:relative;width:min(100%,calc((100dvh - 96px) * ${SLIDE_WIDTH} / ${SLIDE_HEIGHT}));aspect-ratio:${SLIDE_WIDTH} / ${SLIDE_HEIGHT};background:#fff;box-shadow:0 20px 60px rgb(0 0 0 / .5);overflow:hidden}
.frame svg{display:block;width:100%;height:100%}
.open{display:none}

.controls,.modes{display:flex;align-items:center;gap:6px}
.controls a,.controls span.btn,.modes a{padding:6px 12px;border:1px solid #27272a;border-radius:8px;text-decoration:none;color:#d4d4d8}
.controls a:hover,.modes a:hover,.controls a:focus-visible,.modes a:focus-visible{background:#18181b;color:#fff}
.controls span.btn{opacity:.4}
.controls .count{min-width:72px;text-align:center;color:#a1a1aa;font-variant-numeric:tabular-nums}
.controls .gap{flex:1;min-width:16px}
.modes{display:none}

body:has(#overview:target) .modes,body:has(#scroll:target) .modes{display:flex;position:fixed;top:12px;right:12px;z-index:2;background:#0a0a0acc;padding:4px;border-radius:10px;backdrop-filter:blur(6px)}
body:has(#overview:target) .controls,body:has(#scroll:target) .controls{display:none}

body:has(#overview:target) .deck{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;padding:64px 20px 20px}
body:has(#overview:target) .slide{display:block;min-height:0;padding:0}
body:has(#overview:target) .frame{width:100%;box-shadow:none}
body:has(#overview:target) .open{display:block;position:absolute;inset:0;z-index:1}
.open:focus-visible{outline:3px solid #818cf8;outline-offset:2px}

html:has(#scroll:target){scroll-snap-type:y mandatory}
body:has(#scroll:target) .slide{display:flex;scroll-snap-align:center}

body:has(#overview:target) .slide *,body:has(#scroll:target) .slide *{animation:none!important}

@page{size:${SLIDE_WIDTH}px ${SLIDE_HEIGHT}px;margin:0}
@media print{
  html,body{background:#fff}
  .deck{display:block!important;padding:0!important}
  .slide{display:block!important;min-height:0!important;padding:0!important;break-after:page}
  .slide:last-child{break-after:auto}
  .frame{width:${SLIDE_WIDTH}px!important;box-shadow:none}
  .slide *{animation:none!important}
  .controls,.modes,.open{display:none!important}
}
`

function slideSection(svg: string, index: number, total: number) {
  const number = index + 1
  const previous =
    index > 0
      ? `<a href="#slide-${number - 1}" rel="prev" accesskey="p">‹ Prev</a>`
      : `<span class="btn" aria-disabled="true">‹ Prev</span>`
  const next =
    index < total - 1
      ? `<a href="#slide-${number + 1}" rel="next" accesskey="n">Next ›</a>`
      : `<span class="btn" aria-disabled="true">Next ›</span>`
  return `<section id="slide-${number}" class="slide" aria-label="Slide ${number} of ${total}">
<div class="frame">${svg}<a class="open" href="#slide-${number}" aria-label="Open slide ${number}"></a></div>
<nav class="controls" aria-label="Slide navigation">${previous}<span class="count">${number} / ${total}</span>${next}<span class="gap"></span><a href="#overview">Overview</a><a href="#scroll">Scroll</a></nav>
</section>`
}

/** One self-contained HTML file: every slide inline, navigable without script. */
export async function slidesToHtml(slides: string[], title: string) {
  const svgs = await renderSlides(slides, svgToHtml, { animate: true })
  const fonts = await embeddedFontCss(svgs.join(""))
  const stack = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sans")
    .trim()
    .replaceAll('"', "'")
  const family = stack
    ? `${stack}, system-ui, sans-serif`
    : "system-ui, sans-serif"

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Visx">
<title>${escapeHtml(title)}</title>
<style>
${fonts}
:root{--deck-font:${family}}${DECK_CSS}</style>
</head>
<body>
<i id="overview"></i><i id="scroll"></i>
<nav class="modes" aria-label="View"><a href="#slide-1">Present</a><a href="#overview">Overview</a><a href="#scroll">Scroll</a></nav>
<main class="deck">
${svgs.map((svg, index) => slideSection(svg, index, svgs.length)).join("\n")}
</main>
</body>
</html>
`
  return new Blob([html], { type: "text/html;charset=utf-8" })
}
