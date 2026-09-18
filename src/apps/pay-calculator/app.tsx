import { Banknote } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Input } from '@/components/ui/input'

// Working-time assumptions, per the brief.
const WEEKS_PER_MONTH = 4
const DAYS_PER_WEEK = 5
const HOURS_PER_DAY = 8
const HOURS_PER_MONTH = WEEKS_PER_MONTH * DAYS_PER_WEEK * HOURS_PER_DAY // 160

function PayCalculator() {
  const [salary, setSalary] = useState(4000)
  const [hours, setHours] = useState(1)
  const [minutes, setMinutes] = useState(30)

  const { hourlyRate, total, activityHours } = useMemo(() => {
    const rate = salary / HOURS_PER_MONTH
    const durationHours = hours + minutes / 60
    return {
      hourlyRate: rate,
      activityHours: durationHours,
      total: rate * durationHours,
    }
  }, [salary, hours, minutes])

  const money = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-4">
      <Field
        label="Monthly salary"
        hint={`Assumes ${WEEKS_PER_MONTH} weeks/month, ${DAYS_PER_WEEK} days/week, ${HOURS_PER_DAY}h days (${HOURS_PER_MONTH}h total).`}
        className="max-w-xs"
      >
        <Input
          type="number"
          min={0}
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
        />
      </Field>

      <div className="flex items-end gap-3">
        <Field label="Hours" className="w-28">
          <Input
            type="number"
            min={0}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </Field>
        <Field label="Minutes" className="w-28">
          <Input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="rounded-lg border bg-primary/5 p-6 text-center">
        <div className="text-sm text-muted-foreground">
          {activityHours.toFixed(2)}h at {money(hourlyRate)}/hour
        </div>
        <div className="mt-1 text-4xl font-bold tabular-nums">
          {money(total)}
        </div>
      </div>
    </div>
  )
}

export const app: StupidApp = {
  id: 'pay-calculator',
  title: 'How Much Did I Get Paid?',
  description: 'Turn a monthly salary into what an activity actually earned.',
  icon: Banknote,
  category: 'Calculators',
  Component: PayCalculator,
}
