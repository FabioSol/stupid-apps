import { scaleTransform, type Transform } from '@/lib/image-stage/transform'
import { toOklab, type Rgb } from './color-space'
import { segment } from './label-graphcut'
import { buildPalette } from './palette'
import { bilateral } from './prefilter'
import {
  connectedComponents,
  majoritySmooth,
  mergeSmallRegions,
  upscaleNearest,
  type Region,
} from './regions'
import { computeSalience } from './salience'

/** Pixel budget for the expensive graph-cut, and the longer edge for the
 *  final (upscaled, print-friendly) render. */
export const TARGET_PIXELS = 110000
export const RENDER_LONG_EDGE = 1100

export function outputPixels(aspect: number) {
  const h = Math.round(Math.sqrt(TARGET_PIXELS / aspect))
  return { w: Math.round(h * aspect), h }
}

/**
 * Rasterize the framed photo to an offscreen canvas at processing resolution,
 * applying the editor transform (scaled from the mini-viewport). Main-thread
 * only (needs a canvas); the heavy analysis runs in the worker.
 */
export function rasterizeCrop(
  img: HTMLImageElement,
  transform: Transform,
  stageW: number,
  outW: number,
  outH: number,
): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)

  const t = scaleTransform(transform, stageW ? outW / stageW : 1)
  ctx.translate(outW / 2, outH / 2)
  ctx.translate(t.x, t.y)
  ctx.rotate(t.rotation)
  ctx.scale(t.scale, t.scale)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

  return ctx.getImageData(0, 0, outW, outH)
}

export interface RasterLike {
  data: Uint8ClampedArray
  width: number
  height: number
}

export interface PbnOptions {
  numColors: number
  /** 0 → detailed, 1 → smooth. Drives prefilter, MRF strength and merging. */
  smoothing: number
  /** 0 → off, 1 → strongly avoid many black/white tones in the palette. */
  evenTones: number
}

export interface PbnResult {
  palette: Rgb[]
  indices: Uint8Array
  regions: Region[]
  width: number
  height: number
}

/**
 * The full Bayesian-style pipeline (worker-safe, no DOM):
 * OKLab → edge-preserving prefilter → salience-weighted hierarchical palette →
 * alpha-expansion graph-cut labeling → connected components → tiny-region
 * merge → final components.
 */
export function processImage(raster: RasterLike, opts: PbnOptions): PbnResult {
  const { data, width, height } = raster
  const { numColors, smoothing, evenTones } = opts

  const lab0 = toOklab(data)
  const lab = bilateral(lab0, width, height, smoothing)
  const { weight } = computeSalience(lab, width, height, evenTones)

  const palette = buildPalette(lab, data, weight, numColors)

  const lambda = 0.0008 + smoothing * 0.02
  const labels = segment(lab, palette, width, height, lambda, 2)

  const first = connectedComponents(labels, width, height)
  const minArea = Math.max(1, Math.floor(smoothing * 0.004 * width * height))
  const merged = mergeSmallRegions(first.labels, first.regions, width, height, minArea)

  // Drop palette colors the labeling never used and renumber, so the legend
  // only shows colors that actually appear (no near-duplicate phantom entries).
  const { indices, palette: usedPalette } = compactPalette(merged, palette.display)

  // Upscale the low-res label map to a print-friendly resolution and round the
  // blocky staircases, so exported outlines are crisp without the graph-cut
  // paying for millions of pixels.
  const factor = RENDER_LONG_EDGE / Math.max(width, height)
  const W = Math.round(width * factor)
  const H = Math.round(height * factor)
  const up = majoritySmooth(
    upscaleNearest(indices, width, height, W, H),
    W,
    H,
    usedPalette.length,
    2,
  )
  const final = connectedComponents(up, W, H)

  return { palette: usedPalette, indices: up, regions: final.regions, width: W, height: H }
}

function compactPalette(indices: Uint8Array, palette: Rgb[]) {
  const used = [...new Set(indices)].sort((a, b) => a - b)
  const remap = new Map(used.map((old, i) => [old, i]))
  const out = new Uint8Array(indices.length)
  for (let i = 0; i < indices.length; i++) out[i] = remap.get(indices[i])!
  return { indices: out, palette: used.map((o) => palette[o]) }
}
