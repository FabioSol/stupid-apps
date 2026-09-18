import { Calculator } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Textarea } from '@/components/ui/textarea'

function countStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split(/\n/).length : 0
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines,
    sentences,
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-center">
      <div className="text-2xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function TextCounter() {
  const [text, setText] = useState('')
  const stats = useMemo(() => countStats(text), [text])

  return (
    <div className="space-y-4">
      <Field label="Text">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste text…"
          className="min-h-48"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Characters" value={stats.characters} />
        <Stat label="No spaces" value={stats.charactersNoSpaces} />
        <Stat label="Words" value={stats.words} />
        <Stat label="Lines" value={stats.lines} />
        <Stat label="Sentences" value={stats.sentences} />
      </div>
    </div>
  )
}

export const app: StupidApp = {
  id: 'text-counter',
  title: 'Character / Word Counter',
  description: 'Count characters, words, lines and sentences as you type.',
  icon: Calculator,
  category: 'Text',
  Component: TextCounter,
}
