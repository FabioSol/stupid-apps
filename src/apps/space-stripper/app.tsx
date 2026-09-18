import { AlignLeft } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { OutputBox } from '@/components/common/output-box'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface Options {
  collapseSpaces: boolean
  trimLines: boolean
  collapseBlankLines: boolean
}

function normalize(input: string, opts: Options): string {
  let out = input.replace(/\r\n/g, '\n')
  if (opts.collapseSpaces) {
    // Collapse runs of spaces/tabs to a single space, but never touch newlines.
    out = out.replace(/[^\S\n]{2,}/g, ' ')
  }
  if (opts.trimLines) {
    out = out
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
    out = out.replace(/^[^\S\n]+/gm, '')
  }
  if (opts.collapseBlankLines) {
    out = out.replace(/\n{3,}/g, '\n\n')
  }
  return out.trim()
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  )
}

function SpaceStripper() {
  const [input, setInput] = useState('')
  const [opts, setOpts] = useState<Options>({
    collapseSpaces: true,
    trimLines: true,
    collapseBlankLines: true,
  })

  const set = (key: keyof Options) => (v: boolean) =>
    setOpts((o) => ({ ...o, [key]: v }))

  return (
    <div className="space-y-4">
      <Field label="Messy text">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text with too many spaces / indentation…"
          className="min-h-40 font-mono text-sm"
        />
      </Field>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Toggle
          label="Collapse repeated spaces"
          checked={opts.collapseSpaces}
          onChange={set('collapseSpaces')}
        />
        <Toggle
          label="Trim line indentation"
          checked={opts.trimLines}
          onChange={set('trimLines')}
        />
        <Toggle
          label="Collapse blank lines"
          checked={opts.collapseBlankLines}
          onChange={set('collapseBlankLines')}
        />
      </div>
      <Field label="Cleaned up">
        <OutputBox value={normalize(input, opts)} mono={false} />
      </Field>
    </div>
  )
}

export const app: StupidApp = {
  id: 'space-stripper',
  title: 'Extra Spaces Stripper',
  description: 'Collapse stray spaces and indentation back into clean text.',
  icon: AlignLeft,
  category: 'Text',
  Component: SpaceStripper,
}
