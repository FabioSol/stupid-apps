interface GridOverlayProps {
  divisions: number
  /** Dark lines read better on light images; light lines on dark ones. */
  dark: boolean
}

/**
 * An N×N grid fixed over the viewport (not the image), so proportions can be
 * copied cell-by-cell however the reference is zoomed or rotated underneath.
 * Drawn as SVG with a contrast halo so the lines stay visible on any image;
 * `non-scaling-stroke` keeps them crisp and uniform when stretched.
 */
export function GridOverlay({ divisions, dark }: GridOverlayProps) {
  const main = dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'
  const halo = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const ticks = Array.from({ length: divisions + 1 }, (_, i) => (i / divisions) * 100)

  const lines = ticks.map((t, i) => (
    <g key={i}>
      <line x1={t} y1={0} x2={t} y2={100} />
      <line x1={0} y1={t} x2={100} y2={t} />
    </g>
  ))

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <g stroke={halo} strokeWidth={2} vectorEffect="non-scaling-stroke">
        {lines}
      </g>
      <g stroke={main} strokeWidth={1} vectorEffect="non-scaling-stroke">
        {lines}
      </g>
    </svg>
  )
}
