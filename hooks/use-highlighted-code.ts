"use client"

import * as React from "react"

export type HighlightedToken = {
  content: string
  color?: string
  fontStyle?: number
}

export type HighlightedCode = {
  lines: HighlightedToken[][]
  background: string
  foreground: string
}

type Highlighter = Awaited<ReturnType<typeof createHighlighter>>

async function createHighlighter() {
  const { createHighlighter, createJavaScriptRegexEngine } =
    await import("shiki")
  return createHighlighter({
    themes: [],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  })
}

let highlighterPromise: Promise<Highlighter> | undefined
const cache = new Map<string, HighlightedCode>()

async function highlight(
  code: string,
  language: string,
  theme: string
): Promise<HighlightedCode> {
  const key = `${language}\u0000${theme}\u0000${code}`
  const cached = cache.get(key)
  if (cached) return cached

  highlighterPromise ??= createHighlighter()
  const highlighter = await highlighterPromise
  await Promise.all([
    highlighter.loadTheme(theme as never),
    highlighter.loadLanguage(language as never),
  ])
  const result = highlighter.codeToTokens(code, {
    lang: language as never,
    theme: theme as never,
  })
  const value: HighlightedCode = {
    lines: result.tokens,
    background: result.bg ?? "#ffffff",
    foreground: result.fg ?? "#000000",
  }
  if (cache.size > 200) cache.clear()
  cache.set(key, value)
  return value
}

function useHighlightedCode(code: string, language: string, theme: string) {
  const key = `${language}\u0000${theme}\u0000${code}`
  const [result, setResult] = React.useState<{
    key: string
    value: HighlightedCode
  }>()

  React.useEffect(() => {
    let cancelled = false
    highlight(code, language, theme)
      .then((value) => {
        if (!cancelled) setResult({ key, value })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [code, language, theme, key])

  return result?.value
}

export { useHighlightedCode }
