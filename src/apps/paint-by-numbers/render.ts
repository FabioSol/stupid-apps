import type { Rgb } from './quantize'
import type { Region } from './regions'

/** Paint each pixel with its palette color — a posterized preview. */
export function renderPreview(
  ctx: CanvasRenderingContext2D,
  indices: Uint8Array,
  w: number,
  h: number,
  palette: Rgb[],
) {
  const out = ctx.createImageData(w, h)
  for (let i = 0; i < indices.length; i++) {
    const c = palette[indices[i]]
    const o = i * 4
    out.data[o] = c.r
    out.data[o + 1] = c.g
    out.data[o + 2] = c.b
    out.data[o + 3] = 255
  }
  ctx.putImageData(out, 0, 0)
}

/**
 * Draw the printable line art: black region outlines on white, with each
 * region's color number at its centroid (only where it comfortably fits).
 */
export function renderOutline(
  ctx: CanvasRenderingContext2D,
  indices: Uint8Array,
  w: number,
  h: number,
  regions: Region[],
) {
  // Outlines: dark where a pixel differs from its right/bottom neighbor, white
  // everywhere else. White is baked in because putImageData replaces (not
  // blends), so a separate fillRect wouldn't survive.
  const edges = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const here = indices[i]
      const rightDiff = x < w - 1 && indices[i + 1] !== here
      const downDiff = y < h - 1 && indices[i + w] !== here
      const o = i * 4
      const v = rightDiff || downDiff ? 40 : 255
      edges.data[o] = v
      edges.data[o + 1] = v
      edges.data[o + 2] = v
      edges.data[o + 3] = 255
    }
  }
  ctx.putImageData(edges, 0, 0)

  // Numbers at region centroids, sized to the region, skipping tiny ones.
  ctx.fillStyle = '#555555'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const r of regions) {
    const fit = Math.min(r.width, r.height)
    if (r.area < 120 || fit < 14) continue
    const size = Math.max(8, Math.min(fit * 0.5, 22))
    ctx.font = `${size}px sans-serif`
    ctx.fillText(String(r.colorIndex + 1), Math.round(r.cx), Math.round(r.cy))
  }
}
