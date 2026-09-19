import { Frame, ImageUp, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StupidApp } from '@/apps/types'
import { Controls } from './controls'
import { StageContent } from './stage'
import { scaleTransform } from './transform'
import { useGesture } from './use-gesture'

const UNLOCK_TAPS = 5

/** Track the live viewport size so the editor stage mirrors its aspect ratio. */
function useViewport() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])
  return size
}

/** Measure an element's width, updating on resize. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

function TraceHelper() {
  const [src, setSrc] = useState<string | null>(null)
  const [frozen, setFrozen] = useState(false)
  const [gridOn, setGridOn] = useState(true)
  const [divisions, setDivisions] = useState(4)
  const [gridDark, setGridDark] = useState(false)
  const [taps, setTaps] = useState(0)

  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const tapTimer = useRef<number | undefined>(undefined)
  const stageSize = useRef({ w: 0, h: 0 })
  const fittedFor = useRef<string | null>(null)

  const viewport = useViewport()
  const { ref: outerRef, width: outerW } = useWidth()
  const g = useGesture(!frozen)

  // Editor stage matches the viewport's aspect ratio, fit within the space.
  const aspect = viewport.w / viewport.h
  const maxH = Math.min(viewport.h * 0.6, 620)
  const stageW = outerW ? Math.min(outerW, maxH * aspect) : 0
  const stageH = stageW / aspect
  stageSize.current = { w: stageW, h: stageH }

  useEffect(() => () => { if (src) URL.revokeObjectURL(src) }, [src])
  useEffect(() => () => window.clearTimeout(tapTimer.current), [])

  // Lock page scroll while frozen so a full-screen trace can't slide around.
  useEffect(() => {
    if (!frozen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [frozen])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (src) URL.revokeObjectURL(src)
    fittedFor.current = null
    setSrc(URL.createObjectURL(file))
    setFrozen(false)
    e.target.value = ''
  }

  const fitToStage = () => {
    const { w, h } = stageSize.current
    const img = imgRef.current
    if (!w || !img?.naturalWidth) return
    const fit = Math.min(w / img.naturalWidth, h / img.naturalHeight) * 0.95
    g.reset()
    g.setScale(fit)
  }

  const onImgLoad = () => {
    if (fittedFor.current === src) return
    fittedFor.current = src
    fitToStage()
  }

  const onUnlockTap = () => {
    const next = taps + 1
    if (next >= UNLOCK_TAPS) {
      setFrozen(false)
      setTaps(0)
      return
    }
    setTaps(next)
    window.clearTimeout(tapTimer.current)
    tapTimer.current = window.setTimeout(() => setTaps(0), 1500)
  }

  const rotationDeg = (((g.transform.rotation * 180) / Math.PI) % 360 + 360) % 360

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
          <div className="font-medium">Upload a reference image</div>
          <div className="text-sm text-muted-foreground">
            Frame it in the preview, then freeze to fill your screen for tracing.
          </div>
        </button>
      </div>
    )
  }

  // On freeze, scale the framing up from the mini-viewport to the real one.
  const frozenScale = stageW ? viewport.w / stageW : 1
  const frozenTransform = scaleTransform(g.transform, frozenScale)

  return (
    <div ref={outerRef} className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      {/* Editor mini-viewport (hidden while frozen, but kept mounted). */}
      <div className={frozen ? 'pointer-events-none opacity-40' : ''}>
        <div
          ref={g.containerRef}
          {...g.handlers}
          style={{ width: stageW || '100%', height: stageH || 320 }}
          className="relative mx-auto touch-none select-none overflow-hidden rounded-xl border bg-muted shadow-inner"
        >
          <StageContent
            src={src}
            transform={g.transform}
            gridOn={gridOn}
            divisions={divisions}
            gridDark={gridDark}
            imgRef={imgRef}
            onImgLoad={onImgLoad}
          />
        </div>
      </div>

      {frozen ? (
        <p className="text-center text-sm text-muted-foreground">
          Filling your screen. Tap the image {UNLOCK_TAPS} times to unlock.
        </p>
      ) : (
        <Controls
          scale={g.transform.scale}
          rotationDeg={rotationDeg}
          divisions={divisions}
          gridOn={gridOn}
          gridDark={gridDark}
          onZoom={g.zoomBy}
          onRotate={g.rotateBy}
          onSetScale={g.setScale}
          onSetRotation={g.setRotationDeg}
          onDivisions={(n) => setDivisions(Math.min(20, Math.max(2, n)))}
          onToggleGrid={() => setGridOn((v) => !v)}
          onToggleGridColor={() => setGridDark((v) => !v)}
          onReset={fitToStage}
          onReplace={() => fileRef.current?.click()}
          onFreeze={() => { setFrozen(true); setTaps(0) }}
        />
      )}

      {/* Full-screen frozen view, portalled to <body> so it covers the site
          header and escapes any clipping/stacking context. */}
      {frozen
        ? createPortal(
            <button
              type="button"
              onClick={onUnlockTap}
              aria-label="Tap repeatedly to unlock"
              className="fixed inset-0 z-[100] touch-none overflow-hidden overscroll-none bg-black"
            >
              <StageContent
                src={src}
                transform={frozenTransform}
                gridOn={gridOn}
                divisions={divisions}
                gridDark={gridDark}
              />
              <div className="pointer-events-none absolute inset-x-0 top-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-background/85 px-4 py-2 text-sm font-medium shadow backdrop-blur">
                  <Lock className="size-4" />
                  Frozen — tap {UNLOCK_TAPS - taps} more to unlock
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: UNLOCK_TAPS }).map((_, i) => (
                    <span
                      key={i}
                      className={`size-2.5 rounded-full ${i < taps ? 'bg-primary' : 'bg-white/60'}`}
                    />
                  ))}
                </div>
              </div>
            </button>,
            document.body,
          )
        : null}
    </div>
  )
}

export const app: StupidApp = {
  id: 'trace-helper',
  title: 'Trace & Copy Helper',
  description: 'Frame a reference image in a screen-shaped preview, then freeze it full-screen to trace.',
  icon: Frame,
  category: 'Art',
  Component: TraceHelper,
}
