"use client"

import * as React from "react"
import type { UserComponent } from "@craftjs/core"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  DEFAULT_CHART_ROWS,
  DEFAULT_CHART_SERIES,
  sliceColor,
  type ChartKind,
  type ChartRow,
  type ChartSeries,
} from "@/lib/editor/chart"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { ChartDataDialog } from "@/components/editor/dialogs/chart-data-dialog"
import { ElementBox } from "@/components/editor/nodes/element-box"
import { useElementEditing } from "@/components/editor/nodes/use-element-editing"
import { ChartSettings } from "@/components/editor/settings/chart-settings"

export type ChartBoxProps = ElementTransformProps & {
  kind: ChartKind
  series: ChartSeries[]
  rows: ChartRow[]
  stacked: boolean
  donut: boolean
  showLegend: boolean
  showGrid: boolean
  showValues: boolean
  fontSize: number
  textColor: string
  gridColor: string
}

const FONT_FAMILY = "var(--font-sans), system-ui, sans-serif"

function ChartLegend({
  items,
  fontSize,
  textColor,
}: {
  items: { name: string; color: string }[]
  fontSize: number
  textColor: string
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        columnGap: fontSize,
        rowGap: fontSize / 4,
        paddingTop: fontSize / 2,
      }}
    >
      {items.map((item, index) => (
        <span
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: fontSize / 3,
            color: textColor,
            fontSize,
            lineHeight: 1.2,
          }}
        >
          <span
            style={{
              width: fontSize * 0.75,
              height: fontSize * 0.75,
              borderRadius: fontSize / 6,
              background: item.color,
            }}
          />
          {item.name}
        </span>
      ))}
    </div>
  )
}

const ChartBox: UserComponent<Partial<ChartBoxProps>> = (props) => {
  const {
    kind,
    series,
    rows,
    stacked,
    donut,
    showLegend,
    showGrid,
    showValues,
    fontSize,
    textColor,
    gridColor,
    ...transform
  } = { ...ChartBox.craft!.props, ...props } as ChartBoxProps
  const { width, height } = transform
  const { editing, start, stop } = useElementEditing()

  const data = rows.map((row) => ({
    label: row.label,
    ...Object.fromEntries(
      series.map((entry, index) => [`s${index}`, row.values[index] ?? 0])
    ),
  }))

  const legendItems =
    kind === "pie"
      ? rows.map((row, index) => ({
          name: row.label,
          color: sliceColor(index),
        }))
      : series

  const legendHeight = showLegend ? Math.round(fontSize * 2) : 0
  const chartHeight = Math.max(height - legendHeight, 40)
  const gap = Math.round(fontSize / 2)
  const tick = { fill: textColor, fontSize, fontFamily: FONT_FAMILY }
  const axisLine = { stroke: gridColor }
  const valueLabel = {
    fill: textColor,
    fontSize: Math.round(fontSize * 0.85),
    fontFamily: FONT_FAMILY,
  }
  const margin = {
    top: showValues ? fontSize : gap,
    right: gap * 2,
    bottom: gap,
    left: gap,
  }
  const barRadius = Math.round(fontSize / 4)

  let chart: React.ReactNode = null
  if (kind === "bar") {
    chart = (
      <BarChart width={width} height={chartHeight} data={data} margin={margin}>
        {showGrid ? (
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="6 6"
            vertical={false}
          />
        ) : null}
        <XAxis
          dataKey="label"
          tick={tick}
          tickLine={false}
          axisLine={axisLine}
          tickMargin={gap}
        />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={fontSize * 3}
        />
        {series.map((entry, index) => (
          <Bar
            key={index}
            dataKey={`s${index}`}
            name={entry.name}
            fill={entry.color}
            stackId={stacked ? "stack" : undefined}
            radius={stacked ? 0 : [barRadius, barRadius, 0, 0]}
            maxBarSize={fontSize * 3}
            isAnimationActive={false}
            label={
              showValues && !stacked
                ? { position: "top", ...valueLabel }
                : false
            }
          />
        ))}
      </BarChart>
    )
  } else if (kind === "bar-horizontal") {
    chart = (
      <BarChart
        width={width}
        height={chartHeight}
        data={data}
        layout="vertical"
        margin={{ ...margin, right: showValues ? gap * 5 : margin.right }}
      >
        {showGrid ? (
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="6 6"
            horizontal={false}
          />
        ) : null}
        <XAxis
          type="number"
          tick={tick}
          tickLine={false}
          axisLine={axisLine}
          tickMargin={gap}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={fontSize * 4}
        />
        {series.map((entry, index) => (
          <Bar
            key={index}
            dataKey={`s${index}`}
            name={entry.name}
            fill={entry.color}
            stackId={stacked ? "stack" : undefined}
            radius={stacked ? 0 : [0, barRadius, barRadius, 0]}
            maxBarSize={fontSize * 3}
            isAnimationActive={false}
            label={
              showValues && !stacked
                ? { position: "right", ...valueLabel }
                : false
            }
          />
        ))}
      </BarChart>
    )
  } else if (kind === "line") {
    chart = (
      <LineChart width={width} height={chartHeight} data={data} margin={margin}>
        {showGrid ? (
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="6 6"
            vertical={false}
          />
        ) : null}
        <XAxis
          dataKey="label"
          tick={tick}
          tickLine={false}
          axisLine={axisLine}
          tickMargin={gap}
        />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={fontSize * 3}
        />
        {series.map((entry, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={`s${index}`}
            name={entry.name}
            stroke={entry.color}
            strokeWidth={Math.max(fontSize / 8, 2)}
            dot={{ r: fontSize / 4, fill: entry.color, strokeWidth: 0 }}
            isAnimationActive={false}
            label={
              showValues
                ? { position: "top", offset: gap, ...valueLabel }
                : false
            }
          />
        ))}
      </LineChart>
    )
  } else if (kind === "area") {
    chart = (
      <AreaChart width={width} height={chartHeight} data={data} margin={margin}>
        {showGrid ? (
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="6 6"
            vertical={false}
          />
        ) : null}
        <XAxis
          dataKey="label"
          tick={tick}
          tickLine={false}
          axisLine={axisLine}
          tickMargin={gap}
        />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={fontSize * 3}
        />
        {series.map((entry, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={`s${index}`}
            name={entry.name}
            stroke={entry.color}
            fill={entry.color}
            fillOpacity={0.25}
            strokeWidth={Math.max(fontSize / 8, 2)}
            stackId={stacked ? "stack" : undefined}
            isAnimationActive={false}
            label={
              showValues && !stacked
                ? { position: "top", offset: gap, ...valueLabel }
                : false
            }
          />
        ))}
      </AreaChart>
    )
  } else if (kind === "pie") {
    chart = (
      <PieChart width={width} height={chartHeight} margin={margin}>
        <Pie
          data={rows.map((row, index) => ({
            label: row.label,
            value: row.values[0] ?? 0,
            fill: sliceColor(index),
          }))}
          dataKey="value"
          nameKey="label"
          innerRadius={donut ? "55%" : 0}
          outerRadius="90%"
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
          label={showValues ? valueLabel : false}
          labelLine={showValues ? { stroke: gridColor } : false}
        >
          {rows.map((_, index) => (
            <Cell key={index} fill={sliceColor(index)} />
          ))}
        </Pie>
      </PieChart>
    )
  } else {
    chart = (
      <RadarChart
        width={width}
        height={chartHeight}
        data={data}
        margin={margin}
      >
        {showGrid ? <PolarGrid stroke={gridColor} /> : null}
        <PolarAngleAxis dataKey="label" tick={tick} />
        {series.map((entry, index) => (
          <Radar
            key={index}
            dataKey={`s${index}`}
            name={entry.name}
            stroke={entry.color}
            fill={entry.color}
            fillOpacity={0.2}
            strokeWidth={Math.max(fontSize / 8, 2)}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </RadarChart>
    )
  }

  return (
    <ElementBox {...transform} editing={editing} onStartEditing={start}>
      <ChartDataDialog open={editing} onClose={stop} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT_FAMILY,
          pointerEvents: "none",
        }}
      >
        {chart}
        {showLegend ? (
          <ChartLegend
            items={legendItems}
            fontSize={fontSize}
            textColor={textColor}
          />
        ) : null}
      </div>
    </ElementBox>
  )
}

ChartBox.craft = {
  displayName: "Chart",
  props: {
    ...DEFAULT_TRANSFORM,
    x: 480,
    y: 270,
    width: 960,
    height: 540,
    kind: "bar",
    series: DEFAULT_CHART_SERIES,
    rows: DEFAULT_CHART_ROWS,
    stacked: false,
    donut: false,
    showLegend: true,
    showGrid: true,
    showValues: true,
    fontSize: 28,
    textColor: "#71717a",
    gridColor: "#e4e4e7",
  } satisfies ChartBoxProps,
  custom: { handles: "all" },
  related: { settings: ChartSettings },
}

export { ChartBox }
