import { scaleTransform, type Transform } from '@/lib/image-stage/transform'
import { buildPalette, mapToIndices, type Rgb } from './quantize'
import {
  connectedComponents,
  denoise,
  mergeSmallRegions,
  type Region,
} from './regions'

/** Longest edge (px) of the internal processing canvas. */
export const PROCESS_LONG_EDGE = 1000

export function outputPixels(aspect: number) {
  return aspect >= 1
    ? { w: PROCESS_LONG_EDGE, h: Math.round(PROCESS_LONG_EDGE / aspect) }
    : { w: Math.round(PROCESS_LONG_EDGE * aspect), h: PROCESS_LONG_EDGE }
}

/**
 * Rasterize the framed photo to an offscreen canvas at output resolution,
 * applying the same center-origin transform used in the editor (scaled up
 * from the mini-viewport by `outW / stageW`).
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

export interface PbnResult {
  palette: Rgb[]
  indices: Uint8Array
  regions: Region[]
  width: number
  height: number
}

export interface PbnOptions {
  numColors: number
  /** Tone regularization strength, 0 (linear) → 1 (strong). */
  regularization: number
  /** Smoothing amount, 0 → 1. Drives denoise passes and small-region merging. */
  smoothing: number
}

/**
 * Full pipeline: quantize (tone-regularized) → denoise → segment → merge tiny
 * regions → smooth once more → segment for final regions.
 */
export function processImage(raster: ImageData, opts: PbnOptions): PbnResult {
  const { data, width, height } = raster
  const { numColors, regularization, smoothing } = opts

  const passes = 1 + Math.round(smoothing * 4) // 1 → 5
  const minAreaFrac = smoothing * 0.006 // up to 0.6% of the image
  const minArea = Math.max(1, Math.floor(minAreaFrac * width * height))

  const { palette, centroids } = buildPalette(data, numColors, regularization)
  const raw = mapToIndices(data, centroids, regularization)

  let indices = denoise(raw, width, height, palette.length, passes)
  const first = connectedComponents(indices, width, height)
  indices = mergeSmallRegions(first.labels, first.regions, width, height, minArea)
  // A final light majority pass smooths the merged boundaries.
  indices = denoise(indices, width, height, palette.length, 1)

  const { regions } = connectedComponents(indices, width, height)
  return { palette, indices, regions, width, height }
}
