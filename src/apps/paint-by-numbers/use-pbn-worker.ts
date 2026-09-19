import { useEffect, useRef, useState } from 'react'
import type { PbnOptions, PbnResult } from './generate'

/**
 * Runs the paint-by-numbers pipeline in a Web Worker so the heavy graph-cut
 * never blocks the UI. Only the latest job's result is delivered — stale jobs
 * (from rapid slider changes) are ignored.
 */
export function usePbnWorker() {
  const workerRef = useRef<Worker | null>(null)
  const jobRef = useRef(0)
  const [result, setResult] = useState<PbnResult | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (e: MessageEvent<PbnResult & { id: number }>) => {
      if (e.data.id !== jobRef.current) return // stale
      const { palette, indices, regions, width, height } = e.data
      setResult({ palette, indices, regions, width, height })
      setBusy(false)
    }
    workerRef.current = worker
    return () => worker.terminate()
  }, [])

  const run = (raster: ImageData, options: PbnOptions) => {
    const id = ++jobRef.current
    setBusy(true)
    // Copy the pixels so the caller's ImageData stays usable for re-runs.
    const copy = raster.data.slice()
    workerRef.current?.postMessage(
      { id, buffer: copy.buffer, width: raster.width, height: raster.height, options },
      { transfer: [copy.buffer] },
    )
  }

  return { result, busy, run }
}
