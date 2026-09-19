import type { LabImage, Rgb } from './color-space'

export interface Palette {
  /** Display colors (sRGB), light → dark. */
  display: Rgb[]
  /** OKLab centroids [L,a,b] per color, aligned to `display`. */
  lab: Float32Array
}

interface Samples {
  L: Float32Array
  a: Float32Array
  b: Float32Array
  r: Float32Array
  g: Float32Array
  bl: Float32Array
  w: Float32Array
  count: number
}

function sample(
  lab: LabImage,
  data: Uint8ClampedArray,
  weight: Float32Array,
  max = 8000,
): Samples {
  const total = weight.length
  const stride = Math.max(1, Math.floor(total / max))
  const n = Math.ceil(total / stride)
  const s: Samples = {
    L: new Float32Array(n), a: new Float32Array(n), b: new Float32Array(n),
    r: new Float32Array(n), g: new Float32Array(n), bl: new Float32Array(n),
    w: new Float32Array(n), count: 0,
  }
  let k = 0
  for (let i = 0; i < total; i += stride) {
    const j = i * 3
    const o = i * 4
    s.L[k] = lab[j]; s.a[k] = lab[j + 1]; s.b[k] = lab[j + 2]
    s.r[k] = data[o]; s.g[k] = data[o + 1]; s.bl[k] = data[o + 2]
    s.w[k] = weight[i]
    k++
  }
  s.count = k
  return s
}

/** Weighted mean of a box's samples → lab centroid + display color. */
function centroid(s: Samples, idx: number[]) {
  let wsum = 0, L = 0, a = 0, b = 0, r = 0, g = 0, bl = 0
  for (const i of idx) {
    const wt = s.w[i]
    wsum += wt
    L += s.L[i] * wt; a += s.a[i] * wt; b += s.b[i] * wt
    r += s.r[i] * wt; g += s.g[i] * wt; bl += s.bl[i] * wt
  }
  return {
    lab: [L / wsum, a / wsum, b / wsum] as [number, number, number],
    display: { r: Math.round(r / wsum), g: Math.round(g / wsum), b: Math.round(bl / wsum) },
  }
}

/**
 * Hierarchical median-cut in OKLab with importance weights: repeatedly split
 * the box of greatest spread — dominant tones first, then subtones. This is
 * deterministic and doesn't drop clusters the way randomly-seeded k-means can.
 */
export function buildPalette(
  lab: LabImage,
  data: Uint8ClampedArray,
  weight: Float32Array,
  k: number,
): Palette {
  const s = sample(lab, data, weight)
  const chan = [s.L, s.a, s.b]
  const all: number[] = Array.from({ length: s.count }, (_, i) => i)
  let boxes: number[][] = [all]

  const rangeOf = (idx: number[]) => {
    let best = -1
    let bestC = 0
    for (let c = 0; c < 3; c++) {
      let mn = Infinity
      let mx = -Infinity
      for (const i of idx) {
        const v = chan[c][i]
        if (v < mn) mn = v
        if (v > mx) mx = v
      }
      const r = mx - mn
      if (r > best) {
        best = r
        bestC = c
      }
    }
    return { range: best, channel: bestC }
  }

  while (boxes.length < k) {
    // Pick the splittable box with the largest single-channel spread.
    let target = -1
    let targetRange = -1
    let targetChan = 0
    for (let bi = 0; bi < boxes.length; bi++) {
      if (boxes[bi].length < 2) continue
      const { range, channel } = rangeOf(boxes[bi])
      if (range > targetRange) {
        targetRange = range
        target = bi
        targetChan = channel
      }
    }
    if (target < 0 || targetRange <= 0) break

    const box = boxes[target]
    box.sort((i, j) => chan[targetChan][i] - chan[targetChan][j])
    const half = box.reduce((acc, i) => acc + s.w[i], 0) / 2
    let acc = 0
    let cut = 1
    for (let m = 0; m < box.length - 1; m++) {
      acc += s.w[box[m]]
      if (acc >= half) {
        cut = m + 1
        break
      }
    }
    boxes.splice(target, 1, box.slice(0, cut), box.slice(cut))
  }

  // Weighted Lloyd refinement.
  let cents = boxes.map((b) => centroid(s, b))
  for (let iter = 0; iter < 6; iter++) {
    const groups: number[][] = cents.map(() => [])
    for (let i = 0; i < s.count; i++) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < cents.length; c++) {
        const dl = s.L[i] - cents[c].lab[0]
        const da = s.a[i] - cents[c].lab[1]
        const db = s.b[i] - cents[c].lab[2]
        const d = dl * dl + da * da + db * db
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      groups[best].push(i)
    }
    cents = groups.map((gp, i) => (gp.length ? centroid(s, gp) : cents[i]))
  }

  cents.sort((x, y) => y.lab[0] - x.lab[0]) // light → dark
  const labOut = new Float32Array(cents.length * 3)
  cents.forEach((c, i) => {
    labOut[i * 3] = c.lab[0]
    labOut[i * 3 + 1] = c.lab[1]
    labOut[i * 3 + 2] = c.lab[2]
  })
  return { display: cents.map((c) => c.display), lab: labOut }
}
