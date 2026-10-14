const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
]

const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

export function formatRelativeTime(timestamp: number, now = Date.now()) {
  const difference = timestamp - now
  for (const [unit, size] of UNITS) {
    if (Math.abs(difference) >= size) {
      return formatter.format(Math.round(difference / size), unit)
    }
  }
  return "just now"
}
