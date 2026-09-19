import { processImage, type PbnOptions } from './generate'

interface Job {
  id: number
  buffer: ArrayBuffer
  width: number
  height: number
  options: PbnOptions
}

self.onmessage = (e: MessageEvent<Job>) => {
  const { id, buffer, width, height, options } = e.data
  const data = new Uint8ClampedArray(buffer)
  const result = processImage({ data, width, height }, options)
  // Transfer the indices buffer back to avoid a copy.
  self.postMessage(
    {
      id,
      palette: result.palette,
      indices: result.indices,
      regions: result.regions,
      width: result.width,
      height: result.height,
    },
    { transfer: [result.indices.buffer] },
  )
}
