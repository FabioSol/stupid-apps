import { CalendarDays } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Input } from '@/components/ui/input'
import { dateDifference, todayIso } from './diff'

function parseDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-center">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function DateDifferenceTool() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState(todayIso)

  const diff = useMemo(() => {
    const a = parseDate(from)
    const b = parseDate(to)
    if (!a || !b) return null
    return dateDifference(a, b)
  }, [from, to])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From">
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="To" hint="Defaults to today.">
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </div>

      {diff ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {diff.future ? 'That’s in the future — ' : 'That was '}
            <span className="font-medium text-foreground">
              {diff.years > 0 && `${diff.years}y `}
              {diff.months > 0 && `${diff.months}m `}
              {diff.days}d
            </span>
            {diff.future ? ' from now.' : ' ago.'}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total days" value={diff.totalDays.toLocaleString()} />
            <Stat label="Weeks" value={diff.weeks.toLocaleString()} />
            <Stat label="Months (approx)" value={String(diff.years * 12 + diff.months)} />
            <Stat label="Years" value={String(diff.years)} />
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Pick a start date to see the difference.
        </p>
      )}
    </div>
  )
}

export const app: StupidApp = {
  id: 'date-difference',
  title: 'Date Difference',
  description: 'How many days, months and years between two dates.',
  icon: CalendarDays,
  category: 'Time',
  Component: DateDifferenceTool,
}
