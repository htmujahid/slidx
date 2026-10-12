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
export async function embeddedFontCss(markup: string) {
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
