export const DEFAULT_LINE_HEIGHT = 1.2

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const textToHtml = (text: string) =>
  text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("")

export const RICH_TEXT_STYLE = `
.rich-text p { margin: 0; }
.rich-text h1, .rich-text h2, .rich-text h3 { margin: 0; line-height: 1.15; font-weight: 700; }
.rich-text h1 { font-size: 2em; }
.rich-text h2 { font-size: 1.5em; }
.rich-text h3 { font-size: 1.25em; }
.rich-text ul, .rich-text ol { margin: 0; padding-inline-start: 1.4em; }
.rich-text ul { list-style: disc; }
.rich-text ol { list-style: decimal; }
`

export function measureTextHeight(
  text: string,
  fontSize: number,
  lineHeight = DEFAULT_LINE_HEIGHT
) {
  const lines = Math.max(text.split("\n").length, 1)
  return Math.round(lines * fontSize * lineHeight)
}
