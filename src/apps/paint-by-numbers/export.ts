import { jsPDF } from 'jspdf'
import { toHex, type Rgb } from './color-space'
import { orientedSize, type Orientation, type PaperSize } from './paper-sizes'

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/**
 * Build a print-ready PDF: the numbered outline fit to the page with a margin,
 * plus a palette legend of number → color swatches along the bottom.
 */
export function exportPdf(
  outline: HTMLCanvasElement,
  palette: Rgb[],
  paper: PaperSize,
  orientation: Orientation,
) {
  const { wmm, hmm } = orientedSize(paper, orientation)
  const pdf = new jsPDF({
    unit: 'mm',
    format: [wmm, hmm],
    orientation: orientation === 'portrait' ? 'portrait' : 'landscape',
  })

  const margin = 10
  const legendH = 18
  const availW = wmm - margin * 2
  const availH = hmm - margin * 2 - legendH

  // Fit the outline within the available area, preserving aspect.
  const imgAspect = outline.width / outline.height
  let drawW = availW
  let drawH = drawW / imgAspect
  if (drawH > availH) {
    drawH = availH
    drawW = drawH * imgAspect
  }
  const x = (wmm - drawW) / 2
  pdf.addImage(outline.toDataURL('image/png'), 'PNG', x, margin, drawW, drawH)

  // Palette legend.
  const swatch = 6
  const gap = 2
  const perRow = Math.max(1, Math.floor(availW / (swatch + gap + 12)))
  let lx = margin
  let ly = hmm - legendH + 2
  pdf.setFontSize(8)
  palette.forEach((c, i) => {
    if (i > 0 && i % perRow === 0) {
      lx = margin
      ly += swatch + gap
    }
    pdf.setFillColor(c.r, c.g, c.b)
    pdf.setDrawColor(120)
    pdf.rect(lx, ly, swatch, swatch, 'FD')
    pdf.setTextColor(30)
    pdf.text(`${i + 1} ${toHex(c)}`, lx + swatch + 1.5, ly + swatch - 1.5)
    lx += swatch + gap + 14
  })

  pdf.save('paint-by-numbers.pdf')
}
