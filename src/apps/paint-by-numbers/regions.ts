export interface Region {
  colorIndex: number
  area: number
  cx: number
  cy: number
  width: number
  height: number
}

/**
 * Majority (mode) filter over a 3×3 neighborhood, run `passes` times. Removes
 * salt-and-pepper speckle so we get clean, paintable regions instead of noise.
 */
export function denoise(
  indices: Uint8Array,
  w: number,
  h: number,
  colors: number,
  passes: number,
): Uint8Array {
  let current = indices
  const counts = new Uint16Array(colors)
  for (let p = 0; p < passes; p++) {
    const next = new Uint8Array(current.length)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        counts.fill(0)
        let best = current[y * w + x]
        let bestC = 0
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= h) continue
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            if (xx < 0 || xx >= w) continue
            const v = current[yy * w + xx]
            counts[v]++
            if (counts[v] > bestC) {
              bestC = counts[v]
              best = v
            }
          }
        }
        next[y * w + x] = best
      }
    }
    current = next
  }
  return current
}

/**
 * 4-connected components over the index map. Returns a per-pixel label array
 * and a list of regions (color, area, centroid, bounding-box size).
 */
export function connectedComponents(indices: Uint8Array, w: number, h: number) {
  const labels = new Int32Array(indices.length).fill(-1)
  const regions: Region[] = []
  const stack: number[] = []

  for (let start = 0; start < indices.length; start++) {
    if (labels[start] !== -1) continue
    const color = indices[start]
    const id = regions.length
    let area = 0
    let sumX = 0
    let sumY = 0
    let minX = w
    let minY = h
    let maxX = 0
    let maxY = 0

    stack.push(start)
    labels[start] = id
    while (stack.length) {
      const p = stack.pop() as number
      const px = p % w
      const py = (p / w) | 0
      area++
      sumX += px
      sumY += py
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py

      // 4 neighbors
      if (px > 0) tryPush(p - 1)
      if (px < w - 1) tryPush(p + 1)
      if (py > 0) tryPush(p - w)
      if (py < h - 1) tryPush(p + w)
    }

    regions.push({
      colorIndex: color,
      area,
      cx: sumX / area,
      cy: sumY / area,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    })

    function tryPush(n: number) {
      if (labels[n] === -1 && indices[n] === color) {
        labels[n] = id
        stack.push(n)
      }
    }
  }

  return { labels, regions }
}

/**
 * Merge regions smaller than `minArea` into their most-shared neighbor, so
 * speckle disappears. Returns a new index map (small regions adopt the
 * neighbor's color); re-run `connectedComponents` on it for final regions.
 */
export function mergeSmallRegions(
  labels: Int32Array,
  regions: Region[],
  w: number,
  h: number,
  minArea: number,
): Uint8Array {
  // Shared-border counts between adjacent labels.
  const adj: Map<number, number>[] = regions.map(() => new Map())
  const bump = (a: number, b: number) => {
    adj[a].set(b, (adj[a].get(b) ?? 0) + 1)
    adj[b].set(a, (adj[b].get(a) ?? 0) + 1)
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const la = labels[i]
      if (x < w - 1 && labels[i + 1] !== la) bump(la, labels[i + 1])
      if (y < h - 1 && labels[i + w] !== la) bump(la, labels[i + w])
    }
  }

  // Union-find: point each small region at its dominant neighbor.
  const parent = Int32Array.from({ length: regions.length }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }

  const order = regions
    .map((r, i) => ({ i, area: r.area }))
    .sort((a, b) => a.area - b.area)
  for (const { i, area } of order) {
    if (area >= minArea) continue
    let bestNeighbor = -1
    let bestBorder = -1
    for (const [n, border] of adj[i]) {
      if (find(n) === find(i)) continue
      if (border > bestBorder) {
        bestBorder = border
        bestNeighbor = n
      }
    }
    if (bestNeighbor >= 0) parent[find(i)] = find(bestNeighbor)
  }

  const out = new Uint8Array(labels.length)
  for (let p = 0; p < labels.length; p++) {
    out[p] = regions[find(labels[p])].colorIndex
  }
  return out
}
