/**
 * Dinic max-flow / min-cut on a directed graph with reverse arcs. Iterative
 * (explicit stack — safe for the ~10^5-node grids alpha-expansion builds).
 * Edges are stored as consecutive forward/reverse pairs, so an arc's sister
 * is `edge ^ 1`.
 */
export class MaxFlow {
  private head: number[]
  private to: number[] = []
  private cap: number[] = []
  private next: number[] = []

  constructor(nodeHint = 0) {
    this.head = new Array(nodeHint).fill(-1)
  }

  addNode(): number {
    this.head.push(-1)
    return this.head.length - 1
  }

  get nodeCount(): number {
    return this.head.length
  }

  /** Undirected/directed edge with forward `cap` and reverse `rcap`. */
  addEdge(u: number, v: number, cap: number, rcap = 0): void {
    this.to.push(v)
    this.cap.push(cap)
    this.next.push(this.head[u])
    this.head[u] = this.to.length - 1

    this.to.push(u)
    this.cap.push(rcap)
    this.next.push(this.head[v])
    this.head[v] = this.to.length - 1
  }

  maxflow(s: number, t: number): number {
    const { to, cap, next, head } = this
    const n = this.head.length
    const level = new Int32Array(n)
    const it = new Int32Array(n)
    const q = new Int32Array(n)

    const bfs = (): boolean => {
      level.fill(-1)
      let qh = 0
      let qt = 0
      level[s] = 0
      q[qt++] = s
      while (qh < qt) {
        const u = q[qh++]
        for (let e = head[u]; e !== -1; e = next[e]) {
          if (cap[e] > 0 && level[to[e]] < 0) {
            level[to[e]] = level[u] + 1
            q[qt++] = to[e]
          }
        }
      }
      return level[t] >= 0
    }

    let flow = 0
    const nodeStack = new Int32Array(n + 1)
    const edgeStack = new Int32Array(n + 1)

    while (bfs()) {
      for (let i = 0; i < n; i++) it[i] = head[i]
      let sp = 0
      nodeStack[0] = s
      while (sp >= 0) {
        const u = nodeStack[sp]
        if (u === t) {
          let f = Infinity
          for (let i = 0; i < sp; i++) if (cap[edgeStack[i]] < f) f = cap[edgeStack[i]]
          for (let i = 0; i < sp; i++) {
            const e = edgeStack[i]
            cap[e] -= f
            cap[e ^ 1] += f
          }
          flow += f
          let cut = sp
          for (let i = 0; i < sp; i++) {
            if (cap[edgeStack[i]] === 0) {
              cut = i
              break
            }
          }
          sp = cut
          continue
        }
        let advanced = false
        for (let e = it[u]; e !== -1; e = next[e]) {
          it[u] = e
          if (cap[e] > 0 && level[to[e]] === level[u] + 1) {
            edgeStack[sp] = e
            nodeStack[++sp] = to[e]
            advanced = true
            break
          }
        }
        if (!advanced) {
          it[u] = -1
          level[u] = -1
          sp--
        }
      }
    }
    return flow
  }

  /** True for nodes still reachable from `s` in the residual graph (source side). */
  sourceSide(s: number): Uint8Array {
    const { to, cap, next, head } = this
    const n = this.head.length
    const side = new Uint8Array(n)
    const q = new Int32Array(n)
    let qh = 0
    let qt = 0
    side[s] = 1
    q[qt++] = s
    while (qh < qt) {
      const u = q[qh++]
      for (let e = head[u]; e !== -1; e = next[e]) {
        if (cap[e] > 0 && !side[to[e]]) {
          side[to[e]] = 1
          q[qt++] = to[e]
        }
      }
    }
    return side
  }
}
