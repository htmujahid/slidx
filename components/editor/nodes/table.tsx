"use client"

import * as React from "react"
import { useNode, type UserComponent } from "@craftjs/core"

import { createCells, type TableCells } from "@/lib/editor/table"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
  type TextAlign,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { TableSettings } from "@/components/editor/settings/table-settings"

export type TableProps = ElementTransformProps & {
  rows: number
  columns: number
  cells: TableCells
  headerRow: boolean
  headerFill: string
  headerColor: string
  cellFill: string
  textColor: string
  borderColor: string
  borderWidth: number
  fontSize: number
  align: TextAlign
}

const PADDING = 20
const FONT_FAMILY = "var(--font-sans), system-ui, sans-serif"

const Table: UserComponent<Partial<TableProps>> = (props) => {
  const {
    rows,
    columns,
    cells,
    headerRow,
    headerFill,
    headerColor,
    cellFill,
    textColor,
    borderColor,
    borderWidth,
    fontSize,
    align,
    ...transform
  } = { ...Table.craft!.props, ...props } as TableProps
  const { width, height } = transform
  const { editing, start, stop } = useElementEditing()
  const {
    actions: { setProp },
  } = useNode()
  const [active, setActive] = React.useState<[number, number]>([0, 0])
  const [activeRow, activeColumn] = [
    Math.min(active[0], rows - 1),
    Math.min(active[1], columns - 1),
  ]

  const move = (row: number, column: number) => {
    if (row < 0 || row >= rows || column < 0 || column >= columns) return false
    setActive([row, column])
    return true
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") return stop()
    if (event.key === "Tab") {
      event.preventDefault()
      const step = event.shiftKey ? -1 : 1
      const index = activeRow * columns + activeColumn + step
      if (
        !move(
          Math.floor(index / columns),
          ((index % columns) + columns) % columns
        )
      )
        stop()
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (!move(activeRow + (event.shiftKey ? -1 : 1), activeColumn)) stop()
    }
  }

  return (
    <SvgElement {...transform} editing={editing} onStartEditing={start}>
      <foreignObject width={width} height={height}>
        <table
          style={{
            width: "100%",
            height: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontFamily: FONT_FAMILY,
            fontSize,
            userSelect: editing ? undefined : "none",
          }}
        >
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r} style={{ height: `${100 / rows}%` }}>
                {Array.from({ length: columns }, (_, c) => {
                  const isHeader = headerRow && r === 0
                  const isActive =
                    editing && r === activeRow && c === activeColumn
                  return (
                    <td
                      key={c}
                      onDoubleClick={(event) => {
                        event.stopPropagation()
                        setActive([r, c])
                        start()
                      }}
                      onClick={() => editing && setActive([r, c])}
                      style={{
                        background: isHeader ? headerFill : cellFill,
                        border: `${borderWidth}px solid ${borderColor}`,
                        color: isHeader ? headerColor : textColor,
                        fontWeight: isHeader ? 700 : 400,
                        textAlign: align,
                        verticalAlign: "middle",
                        padding: isActive ? 0 : `0 ${PADDING}px`,
                        overflow: "hidden",
                        overflowWrap: "break-word",
                      }}
                    >
                      {isActive ? (
                        <input
                          autoFocus
                          spellCheck={false}
                          aria-label={`Row ${r + 1}, column ${c + 1}`}
                          value={cells[r]?.[c] ?? ""}
                          onFocus={(event) => event.currentTarget.select()}
                          onBlur={stop}
                          onKeyDown={handleKeyDown}
                          onChange={(event) => {
                            const next = event.target.value
                            setProp((draft: TableProps) => {
                              draft.cells[r][c] = next
                            }, 400)
                          }}
                          style={{
                            display: "block",
                            boxSizing: "border-box",
                            width: "100%",
                            height: "100%",
                            margin: 0,
                            padding: `0 ${PADDING}px`,
                            border: "3px solid var(--primary)",
                            outline: 0,
                            background: isHeader ? headerFill : cellFill,
                            color: "inherit",
                            textAlign: align,
                            fontWeight: "inherit",
                            font: "inherit",
                          }}
                        />
                      ) : (
                        (cells[r]?.[c] ?? "")
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </foreignObject>
    </SvgElement>
  )
}

Table.craft = {
  displayName: "Table",
  props: {
    ...DEFAULT_TRANSFORM,
    x: 360,
    y: 250,
    width: 1200,
    height: 520,
    rows: 4,
    columns: 4,
    cells: createCells(4, 4),
    headerRow: true,
    headerFill: "#6366f1",
    headerColor: "#ffffff",
    cellFill: "#ffffff",
    textColor: "#0a0a0a",
    borderColor: "#d4d4d8",
    borderWidth: 2,
    fontSize: 36,
    align: "left",
  } satisfies TableProps,
  custom: { handles: "all" },
  related: { settings: TableSettings },
}

export { Table }
