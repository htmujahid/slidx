"use client"

import * as React from "react"
import { useNode, type UserComponent } from "@craftjs/core"
import { DownloadIcon, WrapTextIcon } from "lucide-react"

import {
  CODE_FONT_SIZE,
  CODE_LINE_HEIGHT,
  CODE_PADDING,
  codeTop,
  measureCodeHeight,
  parseLineRanges,
  type CodeLanguage,
} from "@/lib/editor/code"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { useHighlightedCode } from "@/hooks/use-highlighted-code"
import { Button } from "@/components/ui/button"
import {
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlock as CodeBlockRoot,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { ElementBox } from "@/components/editor/nodes/element-box"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { CodeSettings } from "@/components/editor/settings/code-settings"

export type CodeBlockProps = ElementTransformProps & {
  code: string
  language: CodeLanguage
  lineNumbers: boolean
  highlightLines: string
  header: boolean
  title: string
  wrap: boolean
  showWrap: boolean
  showDownload: boolean
  showCopy: boolean
}

// The line number column is at least 1.5rem wide, followed by a 0.75rem gap.
const CHAR_WIDTH = 0.6
const GUTTER_MIN = 24
const GUTTER_GAP = 12

function download(value: string, filename: string) {
  const url = URL.createObjectURL(new Blob([value], { type: "text/plain" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const CodeBlock: UserComponent<Partial<CodeBlockProps>> = (props) => {
  const {
    code,
    language,
    lineNumbers,
    highlightLines,
    header,
    title,
    wrap,
    showWrap,
    showDownload,
    showCopy,
    ...transform
  } = { ...CodeBlock.craft!.props, ...props } as CodeBlockProps
  const lines = useHighlightedCode(code, language)
  const { editing, start, stop } = useElementEditing()
  const {
    actions: { setProp },
  } = useNode()
  const emphasized = parseLineRanges(highlightLines)

  const gutter = lineNumbers
    ? Math.max(
        GUTTER_MIN,
        String(lines.length).length * CODE_FONT_SIZE * CHAR_WIDTH
      ) + GUTTER_GAP
    : 0

  const updateCode = (next: string) =>
    setProp((draft: CodeBlockProps) => {
      draft.code = next
      draft.height = measureCodeHeight(next, draft.header)
    }, 400)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") return stop()
    if (event.key !== "Tab") return
    event.preventDefault()
    const area = event.currentTarget
    const { selectionStart, selectionEnd, value } = area
    updateCode(
      `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`
    )
    requestAnimationFrame(() => {
      area.selectionStart = area.selectionEnd = selectionStart + 2
    })
  }

  const [toggled, setToggled] = React.useState(false)
  const wrapped = wrap !== toggled

  return (
    <ElementBox {...transform} editing={editing} onStartEditing={start}>
      <CodeBlockRoot className="absolute inset-0 bg-background">
        {header ? (
          <CodeBlockHeader>
            <CodeBlockTitle>{title}</CodeBlockTitle>
            {showWrap || showDownload || showCopy ? (
              <CodeBlockActions>
                {showWrap ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Wrap lines"
                    aria-pressed={wrapped}
                    className="aria-pressed:text-foreground"
                    onClick={() => setToggled(!toggled)}
                  >
                    <WrapTextIcon />
                  </Button>
                ) : null}
                {showDownload ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Download"
                    onClick={() => download(code, title || "code.txt")}
                  >
                    <DownloadIcon />
                  </Button>
                ) : null}
                {showCopy ? <CodeBlockCopyButton value={code} /> : null}
              </CodeBlockActions>
            ) : null}
          </CodeBlockHeader>
        ) : null}
        <CodeBlockContent
          aria-hidden={editing || undefined}
          tabIndex={-1}
          lineNumbers={lineNumbers}
          wrap={wrapped}
          className="flex-1 select-none"
        >
          {lines.map((line, index) => (
            <CodeBlockLine
              key={index}
              variant={emphasized.has(index + 1) ? "highlighted" : "default"}
            >
              {line}
            </CodeBlockLine>
          ))}
        </CodeBlockContent>
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
            className="absolute inset-0 m-0 size-full resize-none overflow-hidden border-0 bg-transparent font-mono text-sm text-transparent caret-foreground outline-none"
            style={{
              padding: CODE_PADDING,
              paddingTop: codeTop(header),
              paddingLeft: CODE_PADDING + gutter,
              lineHeight: `${CODE_LINE_HEIGHT}px`,
              whiteSpace: wrapped ? "pre-wrap" : "pre",
              overflowWrap: wrapped ? "break-word" : undefined,
              tabSize: 2,
            }}
          />
        ) : null}
      </CodeBlockRoot>
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
    x: 640,
    y: 400,
    width: 640,
    height: measureCodeHeight(DEFAULT_CODE),
    code: DEFAULT_CODE,
    language: "typescript",
    lineNumbers: true,
    highlightLines: "",
    header: false,
    title: "",
    wrap: false,
    showWrap: false,
    showDownload: false,
    showCopy: true,
  } satisfies CodeBlockProps,
  custom: { handles: "horizontal" },
  related: { settings: CodeSettings },
}

export { CodeBlock, DEFAULT_CODE }
