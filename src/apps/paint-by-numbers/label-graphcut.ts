import type { LabImage } from './color-space'
import { MaxFlow } from './graphcut'
import type { Palette } from './palette'

const SCALE = 100000

/**
 * Assign each pixel a palette label by minimizing an MRF energy via
 * alpha-expansion graph cuts:
 *
 *   E(f) = Σ_p ‖lab_p − palette[f_p]‖²         (data: fit the color)
 *        + Σ_{p~q} λ·w_pq·[f_p ≠ f_q]           (prior: coherent regions)
 *
 * `w_pq` is contrast-sensitive (small across strong edges), so weak gradients
 * collapse into one region while true borders survive. Each expansion move is
 * solved optimally by a min-cut; moves are accepted only if energy drops.
 */
export function segment(
  lab: LabImage,
  palette: Palette,
  w: number,
  h: number,
  lambda: number,
  cycles = 3,
): Uint8Array {
  const N = w * h
  const K = palette.display.length
  const plab = palette.lab

  const data = (p: number, l: number): number => {
    const j = p * 3
    const k = l * 3
    const dL = lab[j] - plab[k]
    const da = lab[j + 1] - plab[k + 1]
    const db = lab[j + 2] - plab[k + 2]
    return Math.round(SCALE * (dL * dL + da * da + db * db))
  }

  const pairDist2 = (p: number, q: number): number => {
    const jp = p * 3
    const jq = q * 3
    const dL = lab[jp] - lab[jq]
    const da = lab[jp + 1] - lab[jq + 1]
    const db = lab[jp + 2] - lab[jq + 2]
    return dL * dL + da * da + db * db
  }

  // Contrast-sensitive Potts weights (β from mean edge contrast).
  let sum = 0
  let cnt = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (x < w - 1) { sum += pairDist2(i, i + 1); cnt++ }
      if (y < h - 1) { sum += pairDist2(i, i + w); cnt++ }
    }
  }
  const beta = cnt ? 1 / (2 * (sum / cnt) + 1e-9) : 1
  const bRight = new Int32Array(N)
  const bDown = new Int32Array(N)
  const weight = (p: number, q: number) =>
    Math.max(1, Math.round(SCALE * lambda * Math.exp(-pairDist2(p, q) * beta)))
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (x < w - 1) bRight[i] = weight(i, i + 1)
      if (y < h - 1) bDown[i] = weight(i, i + w)
    }
  }

  // Init: nearest palette color (data term only).
  const labels = new Uint8Array(N)
  for (let p = 0; p < N; p++) {
    let best = 0
    let bestD = Infinity
    for (let l = 0; l < K; l++) {
      const d = data(p, l)
      if (d < bestD) { bestD = d; best = l }
    }
    labels[p] = best
  }

  const energyOf = (f: Uint8Array): number => {
    let e = 0
    for (let p = 0; p < N; p++) e += data(p, f[p])
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (x < w - 1 && f[i] !== f[i + 1]) e += bRight[i]
        if (y < h - 1 && f[i] !== f[i + w]) e += bDown[i]
      }
    }
    return e
  }

  let current = energyOf(labels)

  // Reusable per-expansion terminal accumulators. Convention: binary x_p where
  // x_p = 0 → source side → becomes alpha; x_p = 1 → sink side → keeps its label.
  // sCap[p] = cost incurred when p is on the sink side, tCap[p] when on source.
  const sCap = new Float64Array(N)
  const tCap = new Float64Array(N)

  for (let cycle = 0; cycle < cycles; cycle++) {
    let changed = false
    for (let alpha = 0; alpha < K; alpha++) {
      const gf = new MaxFlow(N + 2)
      const S = N
      const T = N + 1
      sCap.fill(0)
      tCap.fill(0)

      // Unary (data) terms.
      for (let p = 0; p < N; p++) {
        sCap[p] += data(p, labels[p]) // keeping the label (sink side)
        tCap[p] += data(p, alpha) // switching to alpha (source side)
      }

      // Pairwise (smoothness) terms via the Kolmogorov–Zabih submodular
      // reparameterization: one directed edge p→q (weight B+C−D, A=0) plus
      // unary adjustments folded into sCap.
      const addPair = (p: number, q: number, b: number) => {
        const fp = labels[p]
        const fq = labels[q]
        const B = fq === alpha ? 0 : b // E(alpha, fq)
        const C = fp === alpha ? 0 : b // E(fp, alpha)
        const D = fp === fq ? 0 : b // E(fp, fq)
        const wpq = B + C - D
        if (wpq > 0) gf.addEdge(p, q, wpq, 0)
        sCap[p] += C
        sCap[q] += D - C
      }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x
          if (x < w - 1) addPair(i, i + 1, bRight[i])
          if (y < h - 1) addPair(i, i + w, bDown[i])
        }
      }

      // Collapse each node's accumulators into a single t-link.
      for (let p = 0; p < N; p++) {
        const net = sCap[p] - tCap[p]
        if (net > 0) gf.addEdge(S, p, net)
        else if (net < 0) gf.addEdge(p, T, -net)
      }

      gf.maxflow(S, T)
      const side = gf.sourceSide(S) // source side → alpha
      const candidate = labels.slice()
      for (let p = 0; p < N; p++) if (side[p]) candidate[p] = alpha

      const e = energyOf(candidate)
      if (e < current) {
        labels.set(candidate)
        current = e
        changed = true
      }
    }
    if (!changed) break
  }

  return labels
}
