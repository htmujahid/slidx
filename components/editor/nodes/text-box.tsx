"use client"

import * as React from "react"
import { useNode, type UserComponent } from "@craftjs/core"

import {
  DEFAULT_LINE_HEIGHT,
  RICH_TEXT_STYLE,
  textToHtml,
} from "@/lib/editor/text"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
  type TextAlign,
} from "@/lib/editor/types"
import { ElementBox } from "@/components/editor/nodes/element-box"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { TextSettings } from "@/components/editor/settings/text-settings"

export type TextBoxProps = ElementTransformProps & {
  text: string
  html: string
  fontSize: number
  fontWeight: number
  fontStyle: "normal" | "italic"
  underline: boolean
  strikethrough: boolean
  fontFamily: string
  fill: string
  align: TextAlign
  lineHeight: number
  letterSpacing: number
  padding: number
  background: string
}

function RichTextEditor({
  initialHtml,
  style,
  onCommit,
  onDone,
}: {
  initialHtml: string
  style: React.CSSProperties
  onCommit: (html: string, text: string) => void
  onDone: () => void
}) {
  const [frozenHtml] = React.useState(initialHtml)
  const [element, setElement] = React.useState<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!element) return
    element.focus()
    const selection = window.getSelection()
    if (selection) {
      selection.selectAllChildren(element)
      selection.collapseToEnd()
    }
  }, [element])

  return (
    <div style={{ width: "100%" }}>
      <div
        ref={setElement}
        className="rich-text"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Text content"
        spellCheck={false}
        style={{ ...style, outline: 0, caretColor: style.color }}
        onInput={(event) => {
          const target = event.currentTarget
          onCommit(target.innerHTML, target.innerText ?? "")
        }}
        onBlur={onDone}
        onKeyDown={(event) => {
          if (event.key === "Escape") onDone()
        }}
        dangerouslySetInnerHTML={{ __html: frozenHtml }}
      />
    </div>
  )
}

const TextBox: UserComponent<Partial<TextBoxProps>> = (props) => {
  const {
    text,
    html,
    fontSize,
    fontWeight,
    fontStyle,
    underline,
    strikethrough,
    fontFamily,
    fill,
    align,
    lineHeight,
    letterSpacing,
    padding,
    background,
    ...transform
  } = { ...TextBox.craft!.props, ...props } as TextBoxProps
  const { height } = transform
  const { editing, start, stop } = useElementEditing()
  const {
    actions: { setProp },
  } = useNode()
  const content = html || textToHtml(text)
  const lastHeight = React.useRef(height)

  const containerStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    color: fill,
    textAlign: align,
    fontSize,
    fontWeight,
    fontStyle,
    fontFamily,
    lineHeight,
    letterSpacing: letterSpacing || undefined,
    padding: padding || undefined,
    background: background || undefined,
    textDecorationLine:
      [underline ? "underline" : null, strikethrough ? "line-through" : null]
        .filter(Boolean)
        .join(" ") || undefined,
    overflowWrap: "break-word",
  }

  const measureRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const element = measureRef.current
    if (!element) return
    const sync = () => {
      if (!element.isConnected || element.offsetHeight === 0) return
      const next = Math.max(Math.round(element.offsetHeight), 24)
      if (Math.abs(lastHeight.current - next) <= 1) return
      lastHeight.current = next
      setProp((draft: TextBoxProps) => {
        draft.height = next
      })
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(element)
    return () => observer.disconnect()
  }, [setProp, editing])

  return (
    <ElementBox {...transform} editing={editing} onStartEditing={start}>
      <div
        ref={measureRef}
        className="rich-text"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          userSelect: editing ? undefined : "none",
        }}
      >
        <style>{RICH_TEXT_STYLE}</style>
        {editing ? (
          <RichTextEditor
            initialHtml={content}
            style={containerStyle}
            onCommit={(nextHtml, nextText) =>
              setProp((draft: TextBoxProps) => {
                draft.html = nextHtml
                draft.text = nextText
              }, 400)
            }
            onDone={stop}
          />
        ) : (
          <div
            style={containerStyle}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </ElementBox>
  )
}

TextBox.craft = {
  displayName: "Text",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 800,
    height: 58,
    text: "Text",
    html: "",
    fontSize: 48,
    fontWeight: 400,
    fontStyle: "normal",
    underline: false,
    strikethrough: false,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    fill: "#0a0a0a",
    align: "left",
    lineHeight: DEFAULT_LINE_HEIGHT,
    letterSpacing: 0,
    padding: 0,
    background: "",
  } satisfies TextBoxProps,
  custom: { handles: "horizontal" },
  related: { settings: TextSettings },
}

export { TextBox }
