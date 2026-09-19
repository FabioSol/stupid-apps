import { Brush, Download, FileImage, ImageUp, Loader2, Wand2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toCssMatrix } from '@/lib/image-stage/transform'
import { useGesture } from '@/lib/image-stage/use-gesture'
import { downloadCanvas, exportPdf } from './export'
import { outputPixels, processImage, rasterizeCrop, type PbnResult } from './generate'
import { aspectOf, PAPER_SIZES, type Orientation } from './paper-sizes'
import { toHex } from './quantize'
import { renderOutline, renderPreview } from './render'

const STAGE_MAX_H = 460

function PaintByNumbers() {
  const [src, setSrc] = useState<string | null>(null)
  const [paperId, setPaperId] = useState('a4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [phase, setPhase] = useState<'edit' | 'result'>('edit')
  const [numColors, setNumColors] = useState(12)
  const [result, setResult] = useState<PbnResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'outline' | 'preview'>('outline')

  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const rasterRef = useRef<ImageData | null>(null)
  const stageSize = useRef({ w: 0, h: 0 })
  const fitKey = useRef<string | null>(null)

  const paper = PAPER_SIZES.find((p) => p.id === paperId)!
  const aspect = aspectOf(paper, orientation)
  const g = useGesture(true)

  const [outerW, setOuterW] = useState(0)
  useEffect(() => {
    if (!outerRef.current) return
    const ro = new ResizeObserver(([e]) => setOuterW(e.contentRect.width))
    ro.observe(outerRef.current)
    return () => ro.disconnect()
  }, [])

  const stageW = outerW ? Math.min(outerW, STAGE_MAX_H * aspect) : 0
  const stageH = stageW / aspect
  stageSize.current = { w: stageW, h: stageH }

  useEffect(() => () => { if (src) URL.revokeObjectURL(src) }, [src])

  const fillStage = () => {
    const img = imgRef.current
    const { w, h } = stageSize.current
    if (!img?.naturalWidth || !w) return
    // Cover the frame (no white margins) — crop overflow is fine.
    const fill = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    g.reset()
    g.setScale(fill)
  }

  // Auto-fill whenever the image or paper framing changes.
  useEffect(() => {
    const key = `${src}|${paperId}|${orientation}`
    if (!src || !stageW || !imgRef.current?.naturalWidth) return
    if (fitKey.current === key) return
    fitKey.current = key
    fillStage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, paperId, orientation, stageW])

  // Re-quantize when the color count changes in the result view.
  useEffect(() => {
    if (phase !== 'result' || !rasterRef.current) return
    setBusy(true)
    const id = setTimeout(() => {
      setResult(processImage(rasterRef.current!, numColors))
      setBusy(false)
    }, 10)
    return () => clearTimeout(id)
  }, [numColors, phase])

  // Draw whenever a result is ready.
  useEffect(() => {
    if (!result) return
    const { indices, regions, palette, width, height } = result
    const oc = outlineRef.current
    const pc = previewRef.current
    if (oc) {
      oc.width = width
      oc.height = height
      renderOutline(oc.getContext('2d')!, indices, width, height, regions)
    }
    if (pc) {
      pc.width = width
      pc.height = height
      renderPreview(pc.getContext('2d')!, indices, width, height, palette)
    }
  }, [result, tab])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (src) URL.revokeObjectURL(src)
    fitKey.current = null
    setSrc(URL.createObjectURL(file))
    setPhase('edit')
    setResult(null)
    e.target.value = ''
  }

  const generate = () => {
    const img = imgRef.current
    if (!img?.naturalWidth) return
    const { w, h } = outputPixels(aspect)
    const raster = rasterizeCrop(img, g.transform, stageSize.current.w, w, h)
    rasterRef.current = raster
    setBusy(true)
    setPhase('result')
    setTimeout(() => {
      setResult(processImage(raster, numColors))
      setBusy(false)
    }, 10)
  }

  if (!src) {
    return (
      <div ref={outerRef}>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/60 hover:bg-accent/40"
        >
          <ImageUp className="size-10 text-muted-foreground" />
          <div className="font-medium">Upload a photo</div>
          <div className="text-sm text-muted-foreground">
            Frame it for your paper size, then turn it into a paint-by-numbers.
          </div>
        </button>
      </div>
    )
  }

  return (
    <div ref={outerRef} className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      {phase === 'edit' ? (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Paper size" className="w-40">
              <Select value={paperId} onValueChange={setPaperId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAPER_SIZES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Tabs value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
              <TabsList>
                <TabsTrigger value="portrait">Portrait</TabsTrigger>
                <TabsTrigger value="landscape">Landscape</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={fillStage}>Fit</Button>
          </div>

          <div
            ref={g.containerRef}
            {...g.handlers}
            style={{ width: stageW || '100%', height: stageH || 320 }}
            className="relative mx-auto touch-none select-none overflow-hidden rounded-xl border bg-muted shadow-inner"
          >
            <div className="absolute inset-0 grid place-items-center">
              <img
                ref={imgRef}
                src={src}
                alt="source"
                draggable={false}
                onLoad={fillStage}
                className="max-w-none select-none"
                style={{ transform: toCssMatrix(g.transform), transformOrigin: 'center' }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <LabeledSlider label="Zoom" value={g.transform.scale * 100} min={10} max={400} unit="%"
              onChange={(v) => g.setScale(v / 100)} />
            <LabeledSlider label="Rotate" value={((g.transform.rotation * 180) / Math.PI % 360 + 360) % 360}
              min={0} max={360} unit="°" onChange={g.setRotationDeg} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Replace</Button>
            <Button onClick={generate} className="gap-1.5">
              <Wand2 className="size-4" /> Generate
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setPhase('edit')}>← Reframe</Button>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'outline' | 'preview')}>
              <TabsList>
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="preview">Colors</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="relative overflow-hidden rounded-xl border bg-white">
            {busy ? (
              <div className="absolute inset-0 z-10 grid place-items-center bg-white/70">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : null}
            <canvas ref={outlineRef} className={`mx-auto block h-auto max-w-full ${tab === 'outline' ? '' : 'hidden'}`} />
            <canvas ref={previewRef} className={`mx-auto block h-auto max-w-full ${tab === 'preview' ? '' : 'hidden'}`} />
          </div>

          <LabeledSlider label="Colors" value={numColors} min={4} max={24} unit=""
            onChange={(v) => setNumColors(Math.round(v))} />

          {result ? (
            <div className="flex flex-wrap gap-2">
              {result.palette.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
                  <span className="grid size-5 place-items-center rounded bg-muted font-mono font-medium">{i + 1}</span>
                  <span className="size-5 rounded border" style={{ backgroundColor: toHex(c) }} />
                  <code className="text-muted-foreground">{toHex(c)}</code>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="gap-1.5"
              onClick={() => outlineRef.current && downloadCanvas(outlineRef.current, 'paint-by-numbers.png')}>
              <Download className="size-4" /> Outline PNG
            </Button>
            <Button variant="outline" className="gap-1.5"
              onClick={() => previewRef.current && downloadCanvas(previewRef.current, 'color-preview.png')}>
              <FileImage className="size-4" /> Preview PNG
            </Button>
            <Button className="gap-1.5" disabled={!result}
              onClick={() => outlineRef.current && result && exportPdf(outlineRef.current, result.palette, paper, orientation)}>
              <Download className="size-4" /> Print PDF
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function LabeledSlider({ label, value, min, max, unit, onChange }: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3">
      <span className="text-sm">{label}</span>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} />
      <span className="text-right font-mono text-sm tabular-nums text-muted-foreground">
        {Math.round(value)}{unit}
      </span>
    </div>
  )
}

export const app: StupidApp = {
  id: 'paint-by-numbers',
  title: 'Paint by Numbers',
  description: 'Turn a photo into a printable paint-by-numbers for N colors.',
  icon: Brush,
  category: 'Art',
  Component: PaintByNumbers,
}
