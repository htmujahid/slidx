import { sectionToHtml } from "@/lib/editor/export"
import { embeddedFontCss } from "@/lib/editor/fonts"
import { renderSlides } from "@/lib/editor/render-slides"
import { slideSizeFromJson, type SlideSize } from "@/lib/editor/slide-size"

const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const deckCss = (page: SlideSize) => `
*,*::before,*::after{box-sizing:border-box}
html{background:#0a0a0a;color-scheme:dark}
body{margin:0;min-height:100dvh;color:#fafafa;font:14px/1.4 var(--deck-font);-webkit-font-smoothing:antialiased}
a{color:inherit}
i[id]{position:absolute;width:0;height:0}

.slide{display:none;position:relative;min-height:100dvh;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px}
.slide:target,.deck:not(:has(.slide:target)) .slide:first-child{display:flex}
.frame{position:relative;width:min(100%,calc((100dvh - 96px) * var(--w) / var(--h)));aspect-ratio:var(--w) / var(--h);background:#fff;box-shadow:0 20px 60px rgb(0 0 0 / .5);overflow:hidden}
.frame>section{display:block;width:100%;height:100%}
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

@page{size:${page.width}px ${page.height}px;margin:0}
@media print{
  html,body{background:#fff}
  .deck{display:block!important;padding:0!important}
  .slide{display:block!important;min-height:0!important;padding:0!important;break-after:page}
  .slide:last-child{break-after:auto}
  .frame{width:calc(var(--w) * 1px)!important;box-shadow:none}
  .slide *{animation:none!important}
  .controls,.modes,.open{display:none!important}
}
`

function slideSection(
  svg: string,
  size: SlideSize,
  index: number,
  total: number
) {
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
<div class="frame" style="--w:${size.width};--h:${size.height}">${svg}<a class="open" href="#slide-${number}" aria-label="Open slide ${number}"></a></div>
<nav class="controls" aria-label="Slide navigation">${previous}<span class="count">${number} / ${total}</span>${next}<span class="gap"></span><a href="#overview">Overview</a><a href="#scroll">Scroll</a></nav>
</section>`
}

/** A lone slide, with no navigation: just the slide, centred and animated. */
function singleSection(svg: string, size: SlideSize) {
  return `<section class="slide">
<div class="frame" style="--w:${size.width};--h:${size.height}">${svg}</div>
</section>`
}

/** Where a lone slide has the whole window, rather than leaving room for controls. */
const SINGLE_CSS =
  ".frame{width:min(100%,calc((100dvh - 32px) * var(--w) / var(--h)))}"

async function buildHtml(
  slides: string[],
  title: string,
  { single }: { single: boolean }
) {
  const svgs = await renderSlides(slides, sectionToHtml, { animate: true })
  const sizes = slides.map(slideSizeFromJson)
  const fonts = await embeddedFontCss(svgs.join(""))
  const stack = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sans")
    .trim()
    .replaceAll('"', "'")
  const family = stack
    ? `${stack}, system-ui, sans-serif`
    : "system-ui, sans-serif"

  const body = single
    ? `<main class="deck">
${singleSection(svgs[0], sizes[0])}
</main>`
    : `<i id="overview"></i><i id="scroll"></i>
<nav class="modes" aria-label="View"><a href="#slide-1">Present</a><a href="#overview">Overview</a><a href="#scroll">Scroll</a></nav>
<main class="deck">
${svgs.map((svg, index) => slideSection(svg, sizes[index], index, svgs.length)).join("\n")}
</main>`

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Visx">
<title>${escapeHtml(title)}</title>
<style>
${fonts}
:root{--deck-font:${family}}${deckCss(sizes[0])}${single ? SINGLE_CSS : ""}</style>
</head>
<body>
${body}
</body>
</html>
`
  return new Blob([html], { type: "text/html;charset=utf-8" })
}

/** One self-contained HTML file: every slide inline, navigable without script. */
export const slidesToHtml = (slides: string[], title: string) =>
  buildHtml(slides, title, { single: false })

/** One slide as its own HTML file, playing its animations when it opens. */
export const slideToHtml = (slide: string, title: string) =>
  buildHtml([slide], title, { single: true })
