export interface Rgb {
  r: number
  g: number
  b: number
}

/** OKLab layout is a flat Float32Array of [L, a, b] triples per pixel. */
export type LabImage = Float32Array

function srgbToLinear(c: number): number {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

/** Convert an RGBA ImageData buffer into a packed OKLab image. */
export function toOklab(data: Uint8ClampedArray): LabImage {
  const n = data.length / 4
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const lr = srgbToLinear(data[o])
    const lg = srgbToLinear(data[o + 1])
    const lb = srgbToLinear(data[o + 2])

    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
    const l_ = Math.cbrt(l)
    const m_ = Math.cbrt(m)
    const s_ = Math.cbrt(s)

    const j = i * 3
    out[j] = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
    out[j + 1] = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
    out[j + 2] = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  }
  return out
}

export function labDist2(lab: LabImage, i: number, L: number, a: number, b: number): number {
  const j = i * 3
  const dL = lab[j] - L
  const da = lab[j + 1] - a
  const db = lab[j + 2] - b
  return dL * dL + da * da + db * db
}

export const toHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
