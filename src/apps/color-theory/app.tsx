import { Palette } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  harmonies,
  hexToHsl,
  hslString,
  hslToHex,
  shades,
  tints,
  tones,
  type Hsl,
} from './color'
import { ColorWheel } from './color-wheel'
import { Swatch, SwatchRow } from './swatch'

function ColorTheory() {
  const [color, setColor] = useState<Hsl>({ h: 265, s: 70, l: 55 })

  const hex = hslToHex(color)
  const schemes = useMemo(() => harmonies(color), [color])
  const ramps = useMemo(
    () => ({
      tints: tints(color),
      tones: tones(color),
      shades: shades(color),
    }),
    [color],
  )

  const onHexInput = (value: string) => {
    const parsed = hexToHsl(value)
    if (parsed) setColor(parsed)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ColorWheel value={color} onChange={(hs) => setColor((c) => ({ ...c, ...hs }))} />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3">
            <span className="size-14 shrink-0 rounded-lg border" style={{ backgroundColor: hex }} />
            <div className="space-y-1">
              <Field label="Hex" className="w-40">
                <Input
                  value={hex}
                  onChange={(e) => onHexInput(e.target.value)}
                  className="font-mono uppercase"
                />
              </Field>
              <p className="font-mono text-xs text-muted-foreground">{hslString(color)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <SliderRow label="Hue" value={color.h} max={360} unit="°"
              onChange={(h) => setColor((c) => ({ ...c, h }))} />
            <SliderRow label="Saturation" value={color.s} max={100} unit="%"
              onChange={(s) => setColor((c) => ({ ...c, s }))} />
            <SliderRow label="Lightness" value={color.l} max={100} unit="%"
              onChange={(l) => setColor((c) => ({ ...c, l }))} />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Harmonies
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {schemes.map((scheme) => (
            <div key={scheme.name} className="space-y-2 rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">{scheme.name}</div>
                <div className="text-xs text-muted-foreground">{scheme.description}</div>
              </div>
              <div className="flex gap-2">
                {scheme.colors.map((c, i) => (
                  <div key={i} className="flex-1">
                    <Swatch color={c} showHex={false} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Tones &amp; subtones
        </h2>
        <SwatchRow label="Tints" hint="mixed toward white" colors={ramps.tints} />
        <SwatchRow label="Tones" hint="mixed toward gray" colors={ramps.tones} />
        <SwatchRow label="Shades" hint="mixed toward black" colors={ramps.shades} />
      </section>
    </div>
  )
}

function SliderRow({ label, value, max, unit, onChange }: {
  label: string
  value: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3">
      <Label className="text-xs">{label}</Label>
      <Slider value={[value]} max={max} step={1} onValueChange={([v]) => onChange(v)} />
      <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
        {Math.round(value)}{unit}
      </span>
    </div>
  )
}

export const app: StupidApp = {
  id: 'color-theory',
  title: 'Color Theory Helper',
  description: 'Pick a color on the wheel and explore harmonies, tints and tones.',
  icon: Palette,
  category: 'Art',
  Component: ColorTheory,
}
