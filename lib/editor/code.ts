// Metrics of the shadcn code block: text-sm, leading-relaxed, p-3, a 1px
// border, and a header of pt-3 plus a size-6 action button.
export const CODE_FONT_SIZE = 14
export const CODE_LINE_HEIGHT = 1.625 * CODE_FONT_SIZE
export const CODE_PADDING = 12
export const CODE_BORDER = 1
export const CODE_HEADER_HEIGHT = 36
export const CODE_HEADER_GAP = 8

export const CODE_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX" },
  { value: "javascript", label: "JavaScript" },
  { value: "jsx", label: "JSX" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "diff", label: "Diff" },
  { value: "markdown", label: "Markdown" },
] as const

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["value"]

export const codeTop = (header: boolean) =>
  header ? CODE_HEADER_HEIGHT + CODE_HEADER_GAP : CODE_PADDING

export function measureCodeHeight(code: string, header = false) {
  const lines = Math.max(code.split("\n").length, 1)
  return Math.round(
    CODE_BORDER * 2 + codeTop(header) + lines * CODE_LINE_HEIGHT + CODE_PADDING
  )
}

export function parseLineRanges(input: string) {
  const lines = new Set<number>()
  for (const part of input.split(",")) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/)
    if (!match) continue
    const start = Number(match[1])
    const end = Number(match[2] ?? match[1])
    for (let line = start; line <= Math.min(end, start + 1000); line++) {
      lines.add(line)
    }
  }
  return lines
}
