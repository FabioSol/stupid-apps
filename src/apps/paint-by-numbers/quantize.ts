export interface Rgb {
  r: number
  g: number
  b: number
}

function dist2(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

function collectSamples(data: Uint8ClampedArray, max = 5000): Rgb[] {
  const total = data.length / 4
  const stride = Math.max(1, Math.floor(total / max))
  const out: Rgb[] = []
  for (let i = 0; i < total; i += stride) {
    const o = i * 4
    out.push({ r: data[o], g: data[o + 1], b: data[o + 2] })
  }
  return out
}

/** k-means++ seeding: spread initial centroids by squared-distance weighting. */
function seed(samples: Rgb[], k: number): Rgb[] {
  const centroids: Rgb[] = [samples[Math.floor(Math.random() * samples.length)]]
  while (centroids.length < k) {
    const dists = samples.map((s) =>
      Math.min(...centroids.map((c) => dist2(s, c))),
    )
    const sum = dists.reduce((a, b) => a + b, 0)
    let target = Math.random() * sum
    let idx = 0
    while (idx < dists.length - 1 && (target -= dists[idx]) > 0) idx++
    centroids.push(samples[idx])
  }
  return centroids.map((c) => ({ ...c }))
}

function nearest(pixel: Rgb, palette: Rgb[]): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const d = dist2(pixel, palette[i])
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** Derive a palette of `k` representative colors via k-means. */
export function buildPalette(data: Uint8ClampedArray, k: number): Rgb[] {
  const samples = collectSamples(data)
  let palette = seed(samples, Math.min(k, samples.length))

  for (let iter = 0; iter < 12; iter++) {
    const sums = palette.map(() => ({ r: 0, g: 0, b: 0, n: 0 }))
    for (const s of samples) {
      const c = nearest(s, palette)
      const acc = sums[c]
      acc.r += s.r
      acc.g += s.g
      acc.b += s.b
      acc.n += 1
    }
    palette = sums.map((acc, i) =>
      acc.n
        ? { r: acc.r / acc.n, g: acc.g / acc.n, b: acc.b / acc.n }
        : palette[i],
    )
  }

  return palette
    .map((c) => ({ r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) }))
    // Sort light→dark so numbering feels orderly.
    .sort((a, b) => b.r + b.g + b.b - (a.r + a.g + a.b))
}

/** Map every pixel to its nearest palette index. */
export function mapToIndices(data: Uint8ClampedArray, palette: Rgb[]): Uint8Array {
  const total = data.length / 4
  const indices = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    const o = i * 4
    indices[i] = nearest({ r: data[o], g: data[o + 1], b: data[o + 2] }, palette)
  }
  return indices
}

export const toHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
