"use client"

import * as React from "react"
import { useNode, type UserComponent } from "@craftjs/core"

import {
  CODE_LINE_HEIGHT,
  CODE_PADDING,
  measureCodeHeight,
  parseLineRanges,
  type CodeLanguage,
  type CodeTheme,
} from "@/lib/editor/code"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import {
  useHighlightedCode,
  type HighlightedToken,
} from "@/hooks/use-highlighted-code"
import { ElementBox } from "@/components/editor/nodes/element-box"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { CodeSettings } from "@/components/editor/settings/code-settings"

export type CodeBlockProps = ElementTransformProps & {
  code: string
  language: CodeLanguage
  theme: CodeTheme
  fontSize: number
  lineNumbers: boolean
  highlightLines: string
  cornerRadius: number
}

const FONT_FAMILY = "var(--font-mono), ui-monospace, monospace"
const CHAR_WIDTH = 0.6

function Tokens({ tokens }: { tokens: HighlightedToken[] }) {
  return tokens.map((token, index) => (
    <span
      key={index}
      style={{
        color: token.color,
        fontStyle:
          token.fontStyle && token.fontStyle & 1 ? "italic" : undefined,
        fontWeight: token.fontStyle && token.fontStyle & 2 ? 700 : undefined,
        textDecoration:
          token.fontStyle && token.fontStyle & 4 ? "underline" : undefined,
      }}
    >
      {token.content}
    </span>
  ))
}

const CodeBlock: UserComponent<Partial<CodeBlockProps>> = (props) => {
  const {
    code,
    language,
    theme,
    fontSize,
    lineNumbers,
    highlightLines,
    cornerRadius,
    ...transform
  } = { ...CodeBlock.craft!.props, ...props } as CodeBlockProps
  const highlighted = useHighlightedCode(code, language, theme)
  const { editing, start, stop } = useElementEditing()
  const {
    actions: { setProp },
  } = useNode()
  const emphasized = React.useMemo(
    () => parseLineRanges(highlightLines),
    [highlightLines]
  )

  const lineSize = fontSize * CODE_LINE_HEIGHT
  const lines =
    highlighted?.lines ?? code.split("\n").map((content) => [{ content }])
  const foreground = highlighted?.foreground ?? "#a1a1aa"
  const background = highlighted?.background ?? "#18181b"
  const gutter = lineNumbers
    ? String(lines.length).length * fontSize * CHAR_WIDTH + CODE_PADDING / 2
    : 0
  const textX = CODE_PADDING + gutter

  const updateCode = (next: string) =>
    setProp((draft: CodeBlockProps) => {
      draft.code = next
      draft.height = measureCodeHeight(next, draft.fontSize)
    }, 400)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") return stop()
    if (event.key !== "Tab") return
    event.preventDefault()
    const area = event.currentTarget
    const { selectionStart, selectionEnd, value } = area
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`
    updateCode(next)
    requestAnimationFrame(() => {
      area.selectionStart = area.selectionEnd = selectionStart + 2
    })
  }

  return (
    <ElementBox {...transform} editing={editing} onStartEditing={start}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: cornerRadius,
          background,
          fontFamily: FONT_FAMILY,
          fontSize,
          lineHeight: `${lineSize}px`,
        }}
      >
        <div
          aria-hidden={editing || undefined}
          style={{
            position: "absolute",
            inset: 0,
            padding: `${CODE_PADDING}px 0`,
            color: foreground,
            whiteSpace: "pre",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {lines.map((tokens, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                height: lineSize,
                paddingLeft: CODE_PADDING,
                background: emphasized.has(index + 1)
                  ? `color-mix(in srgb, ${foreground} 14%, transparent)`
                  : undefined,
              }}
            >
              {lineNumbers ? (
                <span
                  style={{
                    width: gutter,
                    paddingRight: CODE_PADDING / 2,
                    boxSizing: "border-box",
                    textAlign: "right",
                    opacity: emphasized.has(index + 1) ? 0.9 : 0.4,
                  }}
                >
                  {index + 1}
                </span>
              ) : null}
              <span>
                <Tokens tokens={tokens} />
              </span>
            </div>
          ))}
        </div>
        {editing ? (
          <textarea
            autoFocus
            wrap="off"
            spellCheck={false}
            aria-label="Code"
            value={code}
            onBlur={stop}
            onKeyDown={handleKeyDown}
            onChange={(event) => updateCode(event.target.value)}
            style={{
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              width: "100%",
              height: "100%",
              margin: 0,
              padding: `${CODE_PADDING}px ${CODE_PADDING}px ${CODE_PADDING}px ${textX}px`,
              border: 0,
              outline: 0,
              resize: "none",
              overflow: "hidden",
              background: "transparent",
              color: "transparent",
              caretColor: foreground,
              whiteSpace: "pre",
              tabSize: 2,
              font: "inherit",
              lineHeight: `${lineSize}px`,
            }}
          />
        ) : null}
      </div>
    </ElementBox>
  )
}

const DEFAULT_CODE = `function greet(name: string) {
  return \`Hello, \${name}!\`
}

console.log(greet("Visx"))`

CodeBlock.craft = {
  displayName: "Code",
  props: {
    ...DEFAULT_TRANSFORM,
    x: 360,
    y: 300,
    width: 1200,
    height: measureCodeHeight(DEFAULT_CODE, 36),
    code: DEFAULT_CODE,
    language: "typescript",
    theme: "github-dark",
    fontSize: 36,
    lineNumbers: true,
    highlightLines: "",
    cornerRadius: 24,
  } satisfies CodeBlockProps,
  custom: { handles: "horizontal" },
  related: { settings: CodeSettings },
}

export { CodeBlock, DEFAULT_CODE }
