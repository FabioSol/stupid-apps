import { useRef, type PointerEvent } from 'react'
import type { Hsl } from './color'

const SIZE = 240
const RADIUS = SIZE / 2

// A full spin of hue stops for the conic gradient (0° at top, clockwise).
const HUE_STOPS = Array.from({ length: 13 }, (_, i) => {
  const h = i * 30
  return `hsl(${h}, 100%, 50%) ${(h / 360) * 100}%`
}).join(', ')

interface ColorWheelProps {
  /** Current color; only hue + saturation are represented on the wheel. */
  value: Hsl
  /** Fired with new hue/saturation as the user clicks or drags. */
  onChange: (next: Pick<Hsl, 'h' | 's'>) => void
}

/**
 * HSL hue/saturation wheel: angle picks hue, distance from center picks
 * saturation. Lightness is controlled separately by the parent.
 */
export function ColorWheel({ value, onChange }: ColorWheelProps) {
  const ref = useRef<HTMLDivElement>(null)

  const updateFromEvent = (e: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy

    // Angle measured from the top, going clockwise → hue.
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI
    const h = (angle + 360) % 360
    const dist = Math.min(Math.hypot(dx, dy), RADIUS)
    const s = (dist / RADIUS) * 100
    onChange({ h, s })
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromEvent(e)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return
    updateFromEvent(e)
  }

  // Marker position from current hue + saturation.
  const rad = (value.h * Math.PI) / 180
  const markerR = (value.s / 100) * RADIUS
  const mx = RADIUS + Math.sin(rad) * markerR
  const my = RADIUS - Math.cos(rad) * markerR

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      className="relative shrink-0 cursor-crosshair touch-none rounded-full border shadow-inner"
      style={{
        width: SIZE,
        height: SIZE,
        background: `radial-gradient(circle, #fff 0%, transparent 70%), conic-gradient(from 0deg, ${HUE_STOPS})`,
      }}
    >
      <div
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
        style={{ left: mx, top: my }}
      />
    </div>
  )
}
