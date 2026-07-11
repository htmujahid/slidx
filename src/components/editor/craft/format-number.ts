export function formatNumber(value: number) {
  return String(Math.round(value * 100) / 100)
}
