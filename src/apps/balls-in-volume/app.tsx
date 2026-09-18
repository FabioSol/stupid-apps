import { Circle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Input } from '@/components/ui/input'

interface Dims {
  length: number
  width: number
  height: number
  diameter: number
}

function estimate({ length, width, height, diameter }: Dims) {
  if (diameter <= 0) return null
  // Simple axis-aligned grid: how many fit in a straight stack.
  const grid =
    Math.floor(length / diameter) *
    Math.floor(width / diameter) *
    Math.floor(height / diameter)

  const boxVolume = length * width * height
  const ballVolume = (Math.PI / 6) * diameter ** 3
  // Random close packing (~64%) and hexagonal close packing (~74%).
  const random = Math.floor((boxVolume * 0.64) / ballVolume)
  const optimal = Math.floor((boxVolume * 0.7405) / ballVolume)

  return { grid, random, optimal }
}

function DimField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  )
}

function Result({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-center">
      <div className="text-2xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}

function BallsInVolume() {
  const [dims, setDims] = useState<Dims>({
    length: 100,
    width: 100,
    height: 100,
    diameter: 10,
  })

  const set = (key: keyof Dims) => (v: number) =>
    setDims((d) => ({ ...d, [key]: v }))

  const result = useMemo(() => estimate(dims), [dims])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use any unit you like — just keep it consistent across all four fields.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DimField label="Length" value={dims.length} onChange={set('length')} />
        <DimField label="Width" value={dims.width} onChange={set('width')} />
        <DimField label="Height" value={dims.height} onChange={set('height')} />
        <DimField label="Ball ⌀" value={dims.diameter} onChange={set('diameter')} />
      </div>

      {result ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Result label="Grid stack" value={result.grid} hint="Neatly stacked rows" />
          <Result label="Random fill" value={result.random} hint="~64% packing" />
          <Result label="Optimal" value={result.optimal} hint="~74% packing" />
        </div>
      ) : null}
    </div>
  )
}

export const app: StupidApp = {
  id: 'balls-in-volume',
  title: 'Balls in a Volume',
  description: 'Estimate how many balls of a given size fit in a box.',
  icon: Circle,
  category: 'Calculators',
  Component: BallsInVolume,
}
