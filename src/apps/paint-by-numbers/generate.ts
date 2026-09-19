import { scaleTransform, type Transform } from '@/lib/image-stage/transform'
import { buildPalette, mapToIndices, type Rgb } from './quantize'
import { connectedComponents, denoise, type Region } from './regions'

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

/** Quantize → denoise → segment. Palette-building is the slow part. */
export function processImage(
  raster: ImageData,
  numColors: number,
  denoisePasses = 2,
): PbnResult {
  const { data, width, height } = raster
  const palette = buildPalette(data, numColors)
  const raw = mapToIndices(data, palette)
  const indices = denoise(raw, width, height, palette.length, denoisePasses)
  const { regions } = connectedComponents(indices, width, height)
  return { palette, indices, regions, width, height }
}
