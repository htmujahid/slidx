import temml from "temml"

export function latexToMathML(latex: string) {
  try {
    return temml.renderToString(latex, {
      displayMode: true,
      throwOnError: false,
    })
  } catch {
    return ""
  }
}
