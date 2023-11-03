import { Camera } from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import {
  GetTileSizeFn,
  GetViewportFn,
  SetCameraFn,
} from './types.js'

type PointerId = number

const pointerCache = new Map<PointerId, PointerEvent>()

export function initCanvasEventListeners({
  canvas,
  camera,
  setCamera,
  getViewport,
  getTileSize,
}: {
  canvas: HTMLCanvasElement
  camera: Camera
  setCamera: SetCameraFn
  getViewport: GetViewportFn
  getTileSize: GetTileSizeFn
}): void {
  canvas.addEventListener('pointermove', (e) => {
    let prev = pointerCache.get(e.pointerId)
    pointerCache.set(e.pointerId, e)

    if (e.buttons === 1) {
      if (prev) {
        const tileSize = getTileSize()

        camera.position.x +=
          (prev.clientX - e.clientX) / tileSize
        camera.position.y +=
          (prev.clientY - e.clientY) / tileSize

        setCamera(
          camera,
          performance.timeOrigin + e.timeStamp,
        )
      }
      prev = e
    }
  })

  canvas.addEventListener('pointerup', (e) => {
    pointerCache.delete(e.pointerId)
  })
  canvas.addEventListener('pointerout', (e) => {
    pointerCache.delete(e.pointerId)
  })
  canvas.addEventListener('pointerleave', (e) => {
    pointerCache.delete(e.pointerId)
  })

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
  })

  canvas.addEventListener(
    'wheel',
    (e) => {
      camera.zoom = clamp(
        camera.zoom + -e.deltaY / getViewport().size.y,
        0,
        1,
      )
      setCamera(
        camera,
        performance.timeOrigin + e.timeStamp,
      )

      e.preventDefault()
    },
    { passive: false },
  )
}
