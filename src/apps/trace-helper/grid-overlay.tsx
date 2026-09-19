interface GridOverlayProps {
  divisions: number
}

/**
 * An N×N grid fixed over the viewport (not the image), so proportions can be
 * copied cell-by-cell however the reference is zoomed or rotated underneath.
 *
 * Lines are exactly 2px CSS divs (never scaled), blended with `difference`
 * against a white fill so each line paints the inverse of the pixel beneath
 * it — always visible, on any image. Edge lines are skipped so they don't
 * double up with the container border.
 */
export function GridOverlay({ divisions }: GridOverlayProps) {
  const ticks = Array.from(
    { length: divisions - 1 },
    (_, i) => ((i + 1) / divisions) * 100,
  )

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ mixBlendMode: 'difference' }}
    >
      {ticks.map((p, i) => (
        <div
          key={`v${i}`}
          className="absolute inset-y-0 w-0.5 bg-white"
          style={{ left: `${p}%` }}
        />
      ))}
      {ticks.map((p, i) => (
        <div
          key={`h${i}`}
          className="absolute inset-x-0 h-0.5 bg-white"
          style={{ top: `${p}%` }}
        />
      ))}
    </div>
  )
}
