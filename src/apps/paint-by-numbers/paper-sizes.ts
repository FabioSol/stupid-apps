export interface PaperSize {
  id: string
  label: string
  /** Dimensions in millimetres, portrait orientation (w < h). */
  wmm: number
  hmm: number
}

export const PAPER_SIZES: PaperSize[] = [
  { id: 'a3', label: 'A3', wmm: 297, hmm: 420 },
  { id: 'a4', label: 'A4', wmm: 210, hmm: 297 },
  { id: 'a5', label: 'A5', wmm: 148, hmm: 210 },
  { id: 'letter', label: 'US Letter', wmm: 215.9, hmm: 279.4 },
  { id: 'square', label: 'Square', wmm: 210, hmm: 210 },
]

export type Orientation = 'portrait' | 'landscape'

/** Paper dimensions in mm, respecting the chosen orientation. */
export function orientedSize(paper: PaperSize, orientation: Orientation) {
  const portrait = orientation === 'portrait'
  return {
    wmm: portrait ? paper.wmm : paper.hmm,
    hmm: portrait ? paper.hmm : paper.wmm,
  }
}

export function aspectOf(paper: PaperSize, orientation: Orientation): number {
  const { wmm, hmm } = orientedSize(paper, orientation)
  return wmm / hmm
}
