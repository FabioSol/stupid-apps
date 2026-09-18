import { useMemo } from 'react'
import { Field } from './field'
import { Textarea } from '@/components/ui/textarea'

interface NamesInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

/** Parses a textarea of one-name-per-line into a clean list. */
export function parseNames(value: string): string[] {
  return value
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean)
}

/** Shared textarea for entering a list of names (one per line). */
export function NamesInput({ value, onChange, label = 'Names' }: NamesInputProps) {
  const count = useMemo(() => parseNames(value).length, [value])
  return (
    <Field label={label} hint={`${count} ${count === 1 ? 'name' : 'names'} · one per line`}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'Alice\nBob\nCharlie\nDana'}
        className="min-h-40"
      />
    </Field>
  )
}
