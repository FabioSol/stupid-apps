import { dump, load } from 'js-yaml'
import { ArrowLeftRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { OutputBox } from '@/components/common/output-box'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Direction = 'json2yaml' | 'yaml2json'

function convert(input: string, direction: Direction): string {
  if (!input.trim()) return ''
  if (direction === 'json2yaml') {
    return dump(JSON.parse(input), { indent: 2, lineWidth: 100 })
  }
  return JSON.stringify(load(input), null, 2)
}

function JsonYaml() {
  const [direction, setDirection] = useState<Direction>('json2yaml')
  const [input, setInput] = useState('{\n  "hello": "world",\n  "items": [1, 2, 3]\n}')

  const result = useMemo(() => {
    try {
      return { out: convert(input, direction), error: null as string | null }
    } catch (e) {
      return { out: '', error: (e as Error).message }
    }
  }, [input, direction])

  const flip = () => {
    // Swap direction, carrying the current output back into the input.
    if (result.out) setInput(result.out)
    setDirection((d) => (d === 'json2yaml' ? 'yaml2json' : 'json2yaml'))
  }

  const [fromLabel, toLabel] =
    direction === 'json2yaml' ? ['JSON', 'YAML'] : ['YAML', 'JSON']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <Button variant="outline" onClick={flip} className="gap-2">
          {fromLabel}
          <ArrowLeftRight className="size-4" />
          {toLabel}
        </Button>
      </div>
      <Field label={fromLabel}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-40 font-mono text-sm"
        />
      </Field>
      {result.error ? (
        <p className="text-sm text-destructive">⚠️ {result.error}</p>
      ) : null}
      <Field label={toLabel}>
        <OutputBox value={result.out} />
      </Field>
    </div>
  )
}

export const app: StupidApp = {
  id: 'json-yaml',
  title: 'JSON ↔ YAML',
  description: 'Convert between JSON and YAML in either direction.',
  icon: ArrowLeftRight,
  category: 'Text',
  Component: JsonYaml,
}
