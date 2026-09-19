import { Frame, ImageUp, Lock } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Controls } from './controls'
import { GridOverlay } from './grid-overlay'
import { toCssMatrix } from './transform'
import { useGesture } from './use-gesture'

const UNLOCK_TAPS = 5

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

  const g = useGesture(!frozen)

  useEffect(() => () => { if (src) URL.revokeObjectURL(src) }, [src])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setFrozen(false)
    e.target.value = ''
  }

  const fitToView = useCallback(() => {
    const cont = g.containerRef.current
    const img = imgRef.current
    if (!cont || !img?.naturalWidth) return
    const fit = Math.min(
      cont.clientWidth / img.naturalWidth,
      cont.clientHeight / img.naturalHeight,
    )
    g.reset()
    g.setScale(fit * 0.95)
  }, [g])

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
      <div className="space-y-4">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/60 hover:bg-accent/40"
        >
          <ImageUp className="size-10 text-muted-foreground" />
          <div className="font-medium">Upload a reference image</div>
          <div className="text-sm text-muted-foreground">
            Then pan, pinch-zoom and rotate it, overlay a grid, and freeze it to trace.
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <div
        ref={g.containerRef}
        {...g.handlers}
        className="relative h-[65vh] max-h-[720px] min-h-80 touch-none select-none overflow-hidden rounded-xl border bg-muted"
      >
        <div className="absolute inset-0 grid place-items-center">
          <img
            ref={imgRef}
            src={src}
            alt="reference"
            draggable={false}
            onLoad={fitToView}
            style={{ transform: toCssMatrix(g.transform), transformOrigin: 'center', willChange: 'transform' }}
            className="max-w-none"
          />
        </div>

        {gridOn ? <GridOverlay divisions={divisions} dark={gridDark} /> : null}

        {frozen ? (
          <button
            type="button"
            onClick={onUnlockTap}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-transparent"
            aria-label="Tap repeatedly to unfreeze"
          >
            <div className="flex items-center gap-2 rounded-full bg-background/85 px-4 py-2 text-sm font-medium shadow backdrop-blur">
              <Lock className="size-4" />
              Frozen — tap {UNLOCK_TAPS - taps} more to unlock
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: UNLOCK_TAPS }).map((_, i) => (
                <span
                  key={i}
                  className={`size-2.5 rounded-full ${i < taps ? 'bg-primary' : 'bg-background/70'}`}
                />
              ))}
            </div>
          </button>
        ) : null}
      </div>

      {frozen ? (
        <p className="text-center text-sm text-muted-foreground">
          Controls are locked so you won’t nudge the image while tracing.
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
          onReset={fitToView}
          onReplace={() => fileRef.current?.click()}
          onFreeze={() => { setFrozen(true); setTaps(0) }}
        />
      )}
    </div>
  )
}

export const app: StupidApp = {
  id: 'trace-helper',
  title: 'Trace & Copy Helper',
  description: 'Position a reference image, overlay a grid, and freeze it to trace.',
  icon: Frame,
  category: 'Art',
  Component: TraceHelper,
}
