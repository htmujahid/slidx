import { z } from "zod"

// Element types the assistant may create. Images are left out because the
// assistant cannot upload files.
export const ADDABLE_ELEMENTS = [
  "TextBox",
  "Shape",
  "Table",
  "ChartBox",
  "IconBox",
  "EmojiBox",
  "Equation",
  "CodeBlock",
  "ArrowLine",
] as const

export const editOperationSchema = z.object({
  op: z
    .enum([
      "update_element",
      "add_element",
      "delete_element",
      "update_slide",
      "add_slide",
      "delete_slide",
    ])
    .describe("What to do."),
  slide: z
    .number()
    .int()
    .describe(
      "1-based slide number in the deck as it is when this operation runs. For add_slide it is the position the new slide takes."
    ),
  elementId: z
    .string()
    .optional()
    .describe(
      "Element id from the deck context. update_element and delete_element only."
    ),
  elementType: z
    .enum(ADDABLE_ELEMENTS)
    .optional()
    .describe("Type of element to create. add_element only."),
  props: z
    .string()
    .optional()
    .describe(
      'A JSON object, as a string, with the props to set. update_element and update_slide merge it into the existing props; add_element uses it on top of the type defaults. Example: {"text":"Hello","fontSize":64}.'
    ),
})

export const proposeEditsSchema = z.object({
  summary: z.string().describe("One sentence describing the whole change."),
  operations: z
    .array(editOperationSchema)
    .describe("Applied in order, each one seeing the result of the last."),
})

export type EditOperation = z.infer<typeof editOperationSchema>
export type ProposedEdits = z.infer<typeof proposeEditsSchema>
