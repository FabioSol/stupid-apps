import { useState } from 'react'
import { hslToHex, type Hsl } from './color'

interface SwatchProps {
  color: Hsl
  /** Show the hex label under the chip. */
  showHex?: boolean
}

/** A color chip that copies its hex to the clipboard when clicked. */
export function Swatch({ color, showHex = true }: SwatchProps) {
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
      className="group flex flex-col items-stretch gap-1 text-left"
    >
      <span
        className="h-12 w-full rounded-md border transition-transform group-hover:scale-[1.03]"
        style={{ backgroundColor: hex }}
      />
      {showHex ? (
        <span className="text-center font-mono text-xs text-muted-foreground">
          {copied ? 'Copied!' : hex}
        </span>
      ) : null}
    </button>
  )
}

/** A labelled row of swatches (used for harmonies and tone ramps). */
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
