export interface Vec {
  x: number
  y: number
}

/** Image placement: translation (px from center), uniform scale, rotation (rad). */
export interface Transform {
  x: number
  y: number
  scale: number
  rotation: number
}

export const IDENTITY: Transform = { x: 0, y: 0, scale: 1, rotation: 0 }

export const MIN_SCALE = 0.1
export const MAX_SCALE = 20

export function rotateVec(v: Vec, angle: number): Vec {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

/**
 * Scale by `k` and rotate by `dTheta` around `pivot` (a point relative to the
 * container center), keeping that pivot fixed on screen. This is the core of
 * pinch-zoom feeling natural: whatever is under your fingers stays put.
 *
 * Derivation: with screen = center + t + (s·R)·local, holding the pivot fixed
 * gives t' = pivot − k·R(dTheta)·(pivot − t), where k = s'/s.
 */
export function pivotTransform(
  t: Transform,
  pivot: Vec,
  k: number,
  dTheta: number,
): Transform {
  const clampedScale = clampScale(t.scale * k)
  const effectiveK = clampedScale / t.scale
  const rel = { x: pivot.x - t.x, y: pivot.y - t.y }
  const rotated = rotateVec(rel, dTheta)
  return {
    x: pivot.x - effectiveK * rotated.x,
    y: pivot.y - effectiveK * rotated.y,
    scale: clampedScale,
    rotation: t.rotation + dTheta,
  }
}

export function toCssMatrix(t: Transform): string {
  const deg = (t.rotation * 180) / Math.PI
  return `translate(${t.x}px, ${t.y}px) rotate(${deg}deg) scale(${t.scale})`
}
