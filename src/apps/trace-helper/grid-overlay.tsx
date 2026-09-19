interface GridOverlayProps {
  divisions: number
}

/**
 * An N×N grid fixed over the viewport (not the image), so proportions can be
 * copied cell-by-cell however the reference is zoomed or rotated underneath.
 *
 * A single thin white line per interior division, blended with `difference`
 * so each line paints the inverse of the pixel beneath it — always visible,
 * on any image, with no halo or color toggle. Edge lines are skipped so they
 * don't double up with the container border.
 */
export function GridOverlay({ divisions }: GridOverlayProps) {
  const ticks = Array.from(
    { length: divisions - 1 },
    (_, i) => ((i + 1) / divisions) * 100,
  )

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: 'difference' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <g stroke="#ffffff" strokeWidth={1} vectorEffect="non-scaling-stroke">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t} y1={0} x2={t} y2={100} />
            <line x1={0} y1={t} x2={100} y2={t} />
          </g>
        ))}
      </g>
    </svg>
  )
}
