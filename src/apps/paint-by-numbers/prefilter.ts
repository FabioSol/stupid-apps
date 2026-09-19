import type { LabImage } from './color-space'

/**
 * Edge-preserving bilateral filter over an OKLab image. Flattens weak
 * gradients (so smooth areas become single regions) while keeping strong
 * edges sharp (so borders survive). `strength` 0 → skip, 1 → full radius.
 */
export function bilateral(
  lab: LabImage,
  w: number,
  h: number,
  strength: number,
): LabImage {
  if (strength <= 0) return lab
  const radius = 1 + Math.round(strength * 2) // 1 → 3
  const sigmaSpace = radius
  const sigmaRange = 0.06 + 0.12 * (1 - strength) // tighter range = keep edges
  const out = new Float32Array(lab.length)

  // Precompute spatial weights.
  const size = radius * 2 + 1
  const spatial = new Float32Array(size * size)
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      spatial[(dy + radius) * size + (dx + radius)] = Math.exp(
        -(dx * dx + dy * dy) / (2 * sigmaSpace * sigmaSpace),
      )
    }
  }
  const rangeK = 1 / (2 * sigmaRange * sigmaRange)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ci = (y * w + x) * 3
      const cL = lab[ci]
      const ca = lab[ci + 1]
      const cb = lab[ci + 2]
      let sumW = 0
      let sL = 0
      let sa = 0
      let sb = 0
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= w) continue
          const ni = (yy * w + xx) * 3
          const dL = lab[ni] - cL
          const da = lab[ni + 1] - ca
          const db = lab[ni + 2] - cb
          const range = Math.exp(-(dL * dL + da * da + db * db) * rangeK)
          const wgt = spatial[(dy + radius) * size + (dx + radius)] * range
          sumW += wgt
          sL += lab[ni] * wgt
          sa += lab[ni + 1] * wgt
          sb += lab[ni + 2] * wgt
        }
      }
      out[ci] = sL / sumW
      out[ci + 1] = sa / sumW
      out[ci + 2] = sb / sumW
    }
  }
  return out
}
