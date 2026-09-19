import type { LabImage } from './color-space'

export interface Salience {
  /** Per-pixel edge magnitude, normalized 0..1 (Sobel on L). */
  edge: Float32Array
  /** Per-pixel importance weight for palette building (>= 1). */
  weight: Float32Array
}

/**
 * Edge magnitude + importance weight. The weight lifts vivid (high-chroma) and
 * high-contrast pixels so the palette captures important-but-small colors
 * instead of being dominated by large flat backgrounds. `evenTones` (0..1)
 * additionally down-weights near-neutral very dark / very light pixels, so the
 * palette doesn't burn entries on many shades of black or white.
 */
export function computeSalience(
  lab: LabImage,
  w: number,
  h: number,
  evenTones = 0,
): Salience {
  const n = w * h
  const edge = new Float32Array(n)
  let maxEdge = 1e-6

  const Lat = (x: number, y: number) => lab[(y * w + x) * 3]

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const xm = Math.max(0, x - 1)
      const xp = Math.min(w - 1, x + 1)
      const ym = Math.max(0, y - 1)
      const yp = Math.min(h - 1, y + 1)
      const gx =
        Lat(xp, ym) + 2 * Lat(xp, y) + Lat(xp, yp) -
        (Lat(xm, ym) + 2 * Lat(xm, y) + Lat(xm, yp))
      const gy =
        Lat(xm, yp) + 2 * Lat(x, yp) + Lat(xp, yp) -
        (Lat(xm, ym) + 2 * Lat(x, ym) + Lat(xp, ym))
      const mag = Math.hypot(gx, gy)
      edge[y * w + x] = mag
      if (mag > maxEdge) maxEdge = mag
    }
  }

  const weight = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    edge[i] /= maxEdge
    const L = lab[i * 3]
    const a = lab[i * 3 + 1]
    const b = lab[i * 3 + 2]
    const chroma = Math.hypot(a, b) // OKLab chroma, ~0..0.4

    // Extremeness: near-black/near-white AND low-chroma → a neutral extreme.
    const lightExtreme = Math.min(1, Math.max(0, (Math.abs(L - 0.5) * 2 - 0.6) / 0.4))
    const lowChroma = Math.min(1, Math.max(0, 1 - chroma / 0.08))
    const damp = 1 - evenTones * 0.85 * lightExtreme * lowChroma

    weight[i] = (1 + 2.5 * edge[i] + 4 * chroma) * damp
  }

  return { edge, weight }
}
