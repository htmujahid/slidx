export type FieldDef =
  | {
      type: "number"
      key: string
      label: string
      addon?: string
      min?: number
      max?: number
      half?: boolean
    }
  | { type: "text"; key: string; label: string; mono?: boolean }
  | { type: "color"; key: string; label: string }
  | {
      type: "slider"
      key: string
      label: string
      min?: number
      max?: number
      step?: number
      unit?: string
    }
  | { type: "select"; key: string; label: string; options: string[] }
