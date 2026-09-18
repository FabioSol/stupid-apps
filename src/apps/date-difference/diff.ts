export interface DateDiff {
  totalDays: number
  years: number
  months: number
  days: number
  weeks: number
  future: boolean
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Calendar-aware difference between two dates (order-independent). */
export function dateDifference(a: Date, b: Date): DateDiff {
  const future = b < a
  const [start, end] = future ? [b, a] : [a, b]

  const totalDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months -= 1
    // Days in the month preceding the end date.
    const borrowed = new Date(end.getFullYear(), end.getMonth(), 0).getDate()
    days += borrowed
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  return {
    totalDays,
    years,
    months,
    days,
    weeks: Math.floor(totalDays / 7),
    future,
  }
}

export function todayIso(): string {
  const now = new Date()
  const off = now.getTimezoneOffset()
  return new Date(now.getTime() - off * 60000).toISOString().slice(0, 10)
}
