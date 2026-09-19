import { useState } from 'react'
import { cn } from '@/lib/utils'
import { hslToHex, type Hsl } from './color'

/** Pick black or white text so a hex label stays readable on the color. */
export function readableText(color: Hsl): string {
  return color.l > 58 ? '#111827' : '#ffffff'
}

interface SwatchProps {
  color: Hsl
  /** Print the hex on top of the color chip. */
  showHex?: boolean
  className?: string
}

/** A color chip that copies its hex to the clipboard when clicked. */
export function Swatch({ color, showHex = true, className }: SwatchProps) {
  const hex = hslToHex(color)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 900)
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${hex}`}
      style={{ backgroundColor: hex, color: readableText(color) }}
      className={cn(
        'flex h-16 w-full items-end justify-center rounded-md border p-1.5 font-mono text-[11px] font-medium uppercase transition-transform hover:scale-[1.04]',
        className,
      )}
    >
      {showHex ? (copied ? 'Copied!' : hex) : null}
    </button>
  )
}

/** A labelled row of swatches (used for the tint / tone / shade ramps). */
export function SwatchRow({ label, hint, colors }: {
  label: string
  hint?: string
  colors: Hsl[]
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))` }}
      >
        {colors.map((c, i) => (
          <Swatch key={i} color={c} />
        ))}
      </div>
    </div>
  )
}
