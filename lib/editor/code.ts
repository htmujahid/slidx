export const CODE_PADDING = 40
export const CODE_LINE_HEIGHT = 1.6

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
  { value: "markdown", label: "Markdown" },
] as const

export const CODE_THEMES = [
  { value: "github-light", label: "GitHub Light", mode: "light" },
  { value: "one-light", label: "One Light", mode: "light" },
  { value: "vitesse-light", label: "Vitesse Light", mode: "light" },
  { value: "solarized-light", label: "Solarized Light", mode: "light" },
  { value: "catppuccin-latte", label: "Catppuccin Latte", mode: "light" },
  { value: "rose-pine-dawn", label: "Rosé Pine Dawn", mode: "light" },
  { value: "min-light", label: "Min Light", mode: "light" },
  { value: "github-dark", label: "GitHub Dark", mode: "dark" },
  { value: "github-dark-dimmed", label: "GitHub Dark Dimmed", mode: "dark" },
  { value: "one-dark-pro", label: "One Dark Pro", mode: "dark" },
  { value: "dracula", label: "Dracula", mode: "dark" },
  { value: "nord", label: "Nord", mode: "dark" },
  { value: "tokyo-night", label: "Tokyo Night", mode: "dark" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha", mode: "dark" },
  { value: "monokai", label: "Monokai", mode: "dark" },
  { value: "solarized-dark", label: "Solarized Dark", mode: "dark" },
  { value: "night-owl", label: "Night Owl", mode: "dark" },
  { value: "material-theme-palenight", label: "Palenight", mode: "dark" },
  { value: "rose-pine", label: "Rosé Pine", mode: "dark" },
  { value: "vitesse-dark", label: "Vitesse Dark", mode: "dark" },
  { value: "ayu-dark", label: "Ayu Dark", mode: "dark" },
  { value: "synthwave-84", label: "Synthwave '84", mode: "dark" },
  { value: "everforest-dark", label: "Everforest Dark", mode: "dark" },
  { value: "kanagawa-wave", label: "Kanagawa Wave", mode: "dark" },
  { value: "min-dark", label: "Min Dark", mode: "dark" },
] as const

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["value"]
export type CodeTheme = (typeof CODE_THEMES)[number]["value"]

export const countLines = (code: string) => Math.max(code.split("\n").length, 1)

export function measureCodeHeight(code: string, fontSize: number) {
  return Math.round(
    countLines(code) * fontSize * CODE_LINE_HEIGHT + CODE_PADDING * 2
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
