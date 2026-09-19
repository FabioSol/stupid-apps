import { useCallback, useRef, useState } from 'react'
import {
  clampScale,
  IDENTITY,
  pivotTransform,
  rotateVec,
  type Transform,
  type Vec,
} from './transform'

interface TwoFingerSnapshot {
  mid: Vec
  dist: number
  angle: number
}

function midpoint(a: Vec, b: Vec): Vec {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/**
 * Pointer-driven pan / pinch-zoom / twist for the reference image. Works with
 * mouse and touch; two-finger gestures scale and rotate around the midpoint.
 * Pass `enabled = false` (e.g. when frozen) to ignore all input.
 */
export function useGesture(enabled: boolean) {
  const [transform, setTransform] = useState<Transform>(IDENTITY)
  const containerRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, Vec>())
  const lastSingle = useRef<Vec | null>(null)
  const twoFinger = useRef<TwoFingerSnapshot | null>(null)

  const centerOf = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  const twoPoints = (): [Vec, Vec] | null => {
    const pts = [...pointers.current.values()]
    return pts.length >= 2 ? [pts[0], pts[1]] : null
  }

  const snapshot = (a: Vec, b: Vec): TwoFingerSnapshot => ({
    mid: midpoint(a, b),
    dist: Math.hypot(b.x - a.x, b.y - a.y),
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  })

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return
      e.currentTarget.setPointerCapture(e.pointerId)
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const pair = twoPoints()
      if (pair) {
        twoFinger.current = snapshot(pair[0], pair[1])
        lastSingle.current = null
      } else {
        lastSingle.current = { x: e.clientX, y: e.clientY }
      }
    },
    [enabled],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || !pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      const pair = twoPoints()
      if (pair && twoFinger.current) {
        const prev = twoFinger.current
        const curr = snapshot(pair[0], pair[1])
        const center = centerOf()
        const panDx = curr.mid.x - prev.mid.x
        const panDy = curr.mid.y - prev.mid.y
        const k = curr.dist / (prev.dist || 1)
        const dTheta = curr.angle - prev.angle
        const pivot = { x: curr.mid.x - center.x, y: curr.mid.y - center.y }

        setTransform((t) => {
          const panned = { ...t, x: t.x + panDx, y: t.y + panDy }
          return pivotTransform(panned, pivot, k, dTheta)
        })
        twoFinger.current = curr
        return
      }

      if (lastSingle.current) {
        const dx = e.clientX - lastSingle.current.x
        const dy = e.clientY - lastSingle.current.y
        lastSingle.current = { x: e.clientX, y: e.clientY }
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
      }
    },
    [enabled],
  )

  const endPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    const remaining = [...pointers.current.values()]
    twoFinger.current = null
    lastSingle.current = remaining.length === 1 ? remaining[0] : null
  }, [])

  // Center-anchored zoom / rotate for on-screen buttons and sliders.
  const zoomBy = useCallback((factor: number) => {
    setTransform((t) => pivotTransform(t, { x: 0, y: 0 }, factor, 0))
  }, [])

  const rotateBy = useCallback((deltaDeg: number) => {
    setTransform((t) => pivotTransform(t, { x: 0, y: 0 }, 1, (deltaDeg * Math.PI) / 180))
  }, [])

  const setScale = useCallback((scale: number) => {
    setTransform((t) => pivotTransform(t, { x: 0, y: 0 }, clampScale(scale) / t.scale, 0))
  }, [])

  const setRotationDeg = useCallback((deg: number) => {
    setTransform((t) => {
      const target = (deg * Math.PI) / 180
      const rel = { x: -t.x, y: -t.y }
      const rotated = rotateVec(rel, target - t.rotation)
      return { x: -rotated.x, y: -rotated.y, scale: t.scale, rotation: target }
    })
  }, [])

  const reset = useCallback(() => setTransform(IDENTITY), [])

  return {
    containerRef,
    transform,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
    },
    zoomBy,
    rotateBy,
    setScale,
    setRotationDeg,
    reset,
  }
}
