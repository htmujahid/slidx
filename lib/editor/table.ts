export const MAX_TABLE_ROWS = 12
export const MAX_TABLE_COLUMNS = 8

export type TableCells = string[][]

export function createCells(rows: number, columns: number): TableCells {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: columns }, (_, c) =>
      r === 0 ? `Column ${c + 1}` : ""
    )
  )
}

export function resizeCells(
  cells: TableCells,
  rows: number,
  columns: number
): TableCells {
  const next = createCells(rows, columns)
  return next.map((row, r) => row.map((value, c) => cells[r]?.[c] ?? value))
}
