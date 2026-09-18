import { GitCompare } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DiffView, diffStats, type Granularity } from './diff-view'

function TextDiff() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState<Granularity>('word')

  const stats = useMemo(() => diffStats(left, right, mode), [left, right, mode])
  const hasInput = left.length > 0 || right.length > 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Original">
          <Textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste the first version…"
            className="min-h-40 font-mono text-sm"
          />
        </Field>
        <Field label="Changed">
          <Textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste the second version…"
            className="min-h-40 font-mono text-sm"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Granularity)}>
          <TabsList>
            <TabsTrigger value="char">Character</TabsTrigger>
            <TabsTrigger value="word">Word</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
        </Tabs>
        {hasInput ? (
          <div className="flex gap-3 text-sm">
            <span className="text-green-600 dark:text-green-400">
              +{stats.added} added
            </span>
            <span className="text-red-600 dark:text-red-400">
              −{stats.removed} removed
            </span>
          </div>
        ) : null}
      </div>

      {hasInput ? (
        <Field label="Differences">
          <DiffView a={left} b={right} mode={mode} />
        </Field>
      ) : (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Paste text into both boxes to see the differences.
        </p>
      )}
    </div>
  )
}

export const app: StupidApp = {
  id: 'text-diff',
  title: 'Text Diff',
  description: 'Compare two blocks of text by character, word or line.',
  icon: GitCompare,
  category: 'Text',
  Component: TextDiff,
}
