import cronstrue from 'cronstrue'
import { Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Input } from '@/components/ui/input'

const EXAMPLES: { expr: string; note: string }[] = [
  { expr: '*/5 * * * *', note: 'Every 5 minutes' },
  { expr: '0 9 * * 1-5', note: 'Weekdays at 9am' },
  { expr: '0 0 1 * *', note: 'Monthly' },
  { expr: '30 3 * * 0', note: 'Sundays at 3:30am' },
]

const FIELD_NAMES = ['minute', 'hour', 'day (month)', 'month', 'day (week)']

function CronExplainer() {
  const [expr, setExpr] = useState('*/5 * * * *')

  const result = useMemo(() => {
    if (!expr.trim()) return { text: '', error: null as string | null }
    try {
      return {
        text: cronstrue.toString(expr, { verbose: true }),
        error: null,
      }
    } catch (e) {
      return { text: '', error: String(e) }
    }
  }, [expr])

  const parts = expr.trim().split(/\s+/)

  return (
    <div className="space-y-4">
      <Field label="Cron expression">
        <Input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="*/5 * * * *"
          className="font-mono"
        />
      </Field>

      {result.error ? (
        <p className="text-sm text-destructive">⚠️ {result.error}</p>
      ) : result.text ? (
        <div className="rounded-lg border bg-primary/5 p-4 text-lg font-medium">
          {result.text}
        </div>
      ) : null}

      {parts.length === 5 && !result.error ? (
        <div className="grid grid-cols-5 gap-2 text-center">
          {parts.map((p, i) => (
            <div key={i} className="rounded-md border bg-muted/40 p-2">
              <div className="font-mono text-sm">{p}</div>
              <div className="mt-1 text-[10px] uppercase text-muted-foreground">
                {FIELD_NAMES[i]}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <p className="text-sm font-medium">Examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              type="button"
              onClick={() => setExpr(ex.expr)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-accent"
            >
              <code>{ex.expr}</code>
              <span className="ml-1.5 text-muted-foreground">{ex.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export const app: StupidApp = {
  id: 'cron-explainer',
  title: 'Cron Explainer',
  description: 'Translate a cron expression into plain English.',
  icon: Clock,
  category: 'Time',
  Component: CronExplainer,
}
