import { FieldGroup } from "@/components/ui/field"
import type { FieldDef } from "./field-def"
import { PropField } from "./prop-field"

export function PropFields({ fields }: { fields: FieldDef[] }) {
  const rows: FieldDef[][] = []
  for (const field of fields) {
    const previous = rows[rows.length - 1]
    if (
      field.type === "number" &&
      field.half &&
      previous?.length === 1 &&
      previous[0].type === "number" &&
      previous[0].half
    ) {
      previous.push(field)
    } else {
      rows.push([field])
    }
  }

  return (
    <FieldGroup>
      {rows.map((row) =>
        row.length === 2 ? (
          <div key={row[0].key} className="grid grid-cols-2 gap-2">
            {row.map((field) => (
              <PropField key={field.key} field={field} />
            ))}
          </div>
        ) : (
          <PropField key={row[0].key} field={row[0]} />
        )
      )}
    </FieldGroup>
  )
}
