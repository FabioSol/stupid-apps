interface GridOverlayProps {
  divisions: number
}

const LINE_PX = 1

/**
 * An N×N grid fixed over the viewport (not the image), so proportions can be
 * copied cell-by-cell however the reference is zoomed or rotated underneath.
 *
 * Lines are exactly 2px, sized and stretched with inline styles (so they never
 * depend on utility-class generation), blended with `difference` against a
 * white fill so each line paints the inverse of the pixel beneath it. Edge
 * lines are skipped so they don't double up with the container border.
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
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${p}%`,
            width: LINE_PX,
            background: '#fff',
          }}
        />
      ))}
      {ticks.map((p, i) => (
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${p}%`,
            height: LINE_PX,
            background: '#fff',
          }}
        />
      ))}
    </div>
  )
}
