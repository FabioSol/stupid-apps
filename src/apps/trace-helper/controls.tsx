import {
  Grid3x3,
  ImageUp,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

export interface ControlsProps {
  scale: number
  rotationDeg: number
  divisions: number
  gridOn: boolean
  gridDark: boolean
  onZoom: (factor: number) => void
  onRotate: (deltaDeg: number) => void
  onSetScale: (scale: number) => void
  onSetRotation: (deg: number) => void
  onDivisions: (n: number) => void
  onToggleGrid: () => void
  onToggleGridColor: () => void
  onReset: () => void
  onReplace: () => void
  onFreeze: () => void
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className="size-11"
    >
      {children}
    </Button>
  )
}

export function Controls(props: ControlsProps) {
  return (
    <div className="space-y-4 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="Zoom out" onClick={() => props.onZoom(1 / 1.2)}>
          <Minus className="size-5" />
        </IconButton>
        <Slider
          className="min-w-32 flex-1"
          value={[props.scale]}
          min={0.1}
          max={20}
          step={0.05}
          onValueChange={([v]) => props.onSetScale(v)}
          aria-label="Zoom"
        />
        <IconButton label="Zoom in" onClick={() => props.onZoom(1.2)}>
          <Plus className="size-5" />
        </IconButton>
        <span className="w-14 text-right font-mono text-sm text-muted-foreground">
          {Math.round(props.scale * 100)}%
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="Rotate left" onClick={() => props.onRotate(-15)}>
          <RotateCcw className="size-5" />
        </IconButton>
        <Slider
          className="min-w-32 flex-1"
          value={[props.rotationDeg]}
          min={0}
          max={360}
          step={1}
          onValueChange={([v]) => props.onSetRotation(v)}
          aria-label="Rotation"
        />
        <IconButton label="Rotate right" onClick={() => props.onRotate(15)}>
          <RotateCw className="size-5" />
        </IconButton>
        <span className="w-14 text-right font-mono text-sm text-muted-foreground">
          {Math.round(props.rotationDeg)}°
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={props.gridOn ? 'default' : 'outline'}
          onClick={props.onToggleGrid}
          className="h-11 gap-1.5"
        >
          <Grid3x3 className="size-5" />
          Grid
        </Button>
        {props.gridOn ? (
          <>
            <IconButton label="Fewer divisions" onClick={() => props.onDivisions(props.divisions - 1)}>
              <Minus className="size-5" />
            </IconButton>
            <span className="w-16 text-center font-mono text-sm">
              {props.divisions}×{props.divisions}
            </span>
            <IconButton label="More divisions" onClick={() => props.onDivisions(props.divisions + 1)}>
              <Plus className="size-5" />
            </IconButton>
            <IconButton label="Grid color" onClick={props.onToggleGridColor}>
              <Sun className="size-5" />
            </IconButton>
          </>
        ) : null}

        <div className="ml-auto flex gap-2">
          <IconButton label="Reset position" onClick={props.onReset}>
            <RotateCcw className="size-5" />
          </IconButton>
          <IconButton label="Replace image" onClick={props.onReplace}>
            <ImageUp className="size-5" />
          </IconButton>
          <Button onClick={props.onFreeze} className="h-11 gap-1.5">
            <Lock className="size-5" />
            Freeze
          </Button>
        </div>
      </div>
    </div>
  )
}
