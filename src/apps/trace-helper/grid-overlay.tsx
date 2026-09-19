interface GridOverlayProps {
  divisions: number
  /** Light lines read better on dark images and vice-versa. */
  dark: boolean
}

/**
 * An N×N grid fixed over the viewport (not the image), so proportions can be
 * copied cell-by-cell however the reference is zoomed or rotated underneath.
 */
export function GridOverlay({ divisions, dark }: GridOverlayProps) {
  const line = dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)'
  const cell = `${100 / divisions}%`
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: `${cell} ${cell}`,
        // A subtle opposite-color drop shadow keeps lines visible on any image.
        filter: dark
          ? 'drop-shadow(0 0 1px rgba(255,255,255,0.4))'
          : 'drop-shadow(0 0 1px rgba(0,0,0,0.5))',
      }}
    />
  )
}
