"use client"

import * as React from "react"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"

import {
  MAX_TABLE_COLUMNS,
  MAX_TABLE_ROWS,
  resizeCells,
} from "@/lib/editor/table"
import type { TextAlign } from "@/lib/editor/types"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TableProps } from "@/components/editor/nodes/table"
import { ColorSetting } from "@/components/editor/settings/color-setting"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { NumberSetting } from "@/components/editor/settings/number-setting"
import { SettingsRow } from "@/components/editor/settings/settings-row"
import { SettingsSection } from "@/components/editor/settings/settings-section"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

const clamp = (value: number, max: number) =>
  Math.min(Math.max(Math.round(value), 1), max)

const deriveCells = (props: TableProps) => ({
  cells: resizeCells(props.cells, props.rows, props.columns),
})

function TableSettings() {
  const { props, update } = useNodeProps<TableProps>(deriveCells)
  const headerId = React.useId()

  return (
    <>
      <SettingsSection title="Table">
        <SettingsRow>
          <NumberSetting
            label="Rows"
            value={props.rows}
            min={1}
            max={MAX_TABLE_ROWS}
            onChange={(rows) => update({ rows: clamp(rows, MAX_TABLE_ROWS) })}
          />
          <NumberSetting
            label="Columns"
            value={props.columns}
            min={1}
            max={MAX_TABLE_COLUMNS}
            onChange={(columns) =>
              update({ columns: clamp(columns, MAX_TABLE_COLUMNS) })
            }
          />
        </SettingsRow>
        <Field orientation="horizontal">
          <FieldLabel htmlFor={headerId}>Header row</FieldLabel>
          <Switch
            id={headerId}
            checked={props.headerRow}
            onCheckedChange={(headerRow) => update({ headerRow })}
          />
        </Field>
      </SettingsSection>

      <SettingsSection title="Style">
        <SettingsRow>
          <NumberSetting
            label="Font size"
            value={props.fontSize}
            min={8}
            max={200}
            onChange={(fontSize) => update({ fontSize })}
          />
          <NumberSetting
            label="Border"
            value={props.borderWidth}
            min={0}
            max={16}
            onChange={(borderWidth) => update({ borderWidth })}
          />
        </SettingsRow>
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Text alignment"
          value={[props.align]}
          onValueChange={([align]) => {
            if (align) update({ align: align as TextAlign })
          }}
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        {props.headerRow ? (
          <SettingsRow>
            <ColorSetting
              label="Header fill"
              value={props.headerFill}
              onChange={(headerFill) => update({ headerFill })}
            />
            <ColorSetting
              label="Header text"
              value={props.headerColor}
              onChange={(headerColor) => update({ headerColor })}
            />
          </SettingsRow>
        ) : null}
        <SettingsRow>
          <ColorSetting
            label="Cell fill"
            value={props.cellFill}
            onChange={(cellFill) => update({ cellFill })}
          />
          <ColorSetting
            label="Text"
            value={props.textColor}
            onChange={(textColor) => update({ textColor })}
          />
        </SettingsRow>
        <ColorSetting
          label="Border color"
          value={props.borderColor}
          onChange={(borderColor) => update({ borderColor })}
        />
      </SettingsSection>

      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { TableSettings }
