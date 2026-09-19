import type { Ref } from 'react'
import { GridOverlay } from './grid-overlay'
import { toCssMatrix, type Transform } from './transform'

interface StageContentProps {
  src: string
  transform: Transform
  gridOn: boolean
  divisions: number
  imgRef?: Ref<HTMLImageElement>
  onImgLoad?: () => void
}

/**
 * The composed stage: the reference image centered and transformed, with the
 * grid on top. Rendered identically in the editor and full-screen, just at
 * different sizes — the parent scales the transform to match.
 */
export function StageContent({
  src,
  transform,
  gridOn,
  divisions,
  imgRef,
  onImgLoad,
}: StageContentProps) {
  return (
    <>
      <div className="absolute inset-0 grid place-items-center">
        <img
          ref={imgRef}
          src={src}
          alt="reference"
          draggable={false}
          onLoad={onImgLoad}
          className="max-w-none select-none"
          style={{
            transform: toCssMatrix(transform),
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        />
      </div>
      {gridOn ? <GridOverlay divisions={divisions} /> : null}
    </>
  )
}
