"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import {
  MAX_CHART_ROWS,
  MAX_CHART_SERIES,
  seriesColor,
  type ChartRow,
  type ChartSeries,
} from "@/lib/editor/chart"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { ChartBoxProps } from "@/components/editor/nodes/chart-box"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function ChartDataDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { props, update } = useNodeProps<ChartBoxProps>()
  const { series, rows } = props

  const updateSeries = (index: number, patch: Partial<ChartSeries>) =>
    update({
      series: series.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry
      ),
    })

  const updateRow = (index: number, patch: Partial<ChartRow>) =>
    update({
      rows: rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    })

  const addSeries = () =>
    update({
      series: [
        ...series,
        {
          name: `Series ${series.length + 1}`,
          color: seriesColor(series.length),
        },
      ],
      rows: rows.map((row) => ({ ...row, values: [...row.values, 0] })),
    })

  const removeSeries = (index: number) =>
    update({
      series: series.filter((_, i) => i !== index),
      rows: rows.map((row) => ({
        ...row,
        values: row.values.filter((_, i) => i !== index),
      })),
    })

  const addRow = () =>
    update({
      rows: [
        ...rows,
        { label: `Item ${rows.length + 1}`, values: series.map(() => 0) },
      ],
    })

  const removeRow = (index: number) =>
    update({ rows: rows.filter((_, i) => i !== index) })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chart data</DialogTitle>
          <DialogDescription>
            {props.kind === "pie"
              ? "Pie charts plot the first series; slices are colored by row."
              : "Each series is one color on the chart; each row is one point along it."}
          </DialogDescription>
        </DialogHeader>
        <div className="-m-1 overflow-x-auto p-1">
          <div
            className="grid min-w-full items-center gap-1.5"
            style={{
              gridTemplateColumns: `minmax(6rem, 1fr) repeat(${series.length}, minmax(9rem, 1fr)) 2rem`,
            }}
          >
            <span aria-hidden />
            {series.map((entry, index) => (
              <InputGroup key={index}>
                <InputGroupAddon>
                  <input
                    type="color"
                    aria-label={`Series ${index + 1} color`}
                    value={entry.color}
                    onChange={(event) =>
                      updateSeries(index, { color: event.target.value })
                    }
                    className="size-5 cursor-pointer rounded-sm border-0 bg-transparent p-0"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label={`Series ${index + 1} name`}
                  value={entry.name}
                  onChange={(event) =>
                    updateSeries(index, { name: event.target.value })
                  }
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={`Remove series ${entry.name || index + 1}`}
                    disabled={series.length <= 1}
                    onClick={() => removeSeries(index)}
                  >
                    <Trash2Icon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Add series"
              title="Add series"
              disabled={series.length >= MAX_CHART_SERIES}
              onClick={addSeries}
            >
              <PlusIcon />
            </Button>
            {rows.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <Input
                  aria-label={`Row ${rowIndex + 1} label`}
                  value={row.label}
                  className="h-8"
                  onChange={(event) =>
                    updateRow(rowIndex, { label: event.target.value })
                  }
                />
                {row.values.map((value, seriesIndex) => (
                  <Input
                    key={seriesIndex}
                    type="number"
                    inputMode="decimal"
                    aria-label={`${row.label || `Row ${rowIndex + 1}`} · ${
                      series[seriesIndex]?.name ?? `Series ${seriesIndex + 1}`
                    }`}
                    value={value}
                    className="h-8"
                    onChange={(event) => {
                      const next = event.target.valueAsNumber
                      updateRow(rowIndex, {
                        values: row.values.map((current, i) =>
                          i === seriesIndex
                            ? Number.isNaN(next)
                              ? 0
                              : next
                            : current
                        ),
                      })
                    }}
                  />
                ))}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove row ${row.label || rowIndex + 1}`}
                  disabled={rows.length <= 1}
                  onClick={() => removeRow(rowIndex)}
                >
                  <Trash2Icon />
                </Button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            disabled={rows.length >= MAX_CHART_ROWS}
            onClick={addRow}
          >
            <PlusIcon />
            Add row
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ChartDataDialog }
