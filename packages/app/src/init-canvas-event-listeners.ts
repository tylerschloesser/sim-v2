import { Camera } from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import {
  GetTileSizeFn,
  GetViewportFn,
  SetCameraFn,
} from './types.js'

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
  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        const tileSize = getTileSize()
        camera.position.x +=
          (e.clientX - prev.clientX) / tileSize
        camera.position.y +=
          (e.clientY - prev.clientY) / tileSize

        setCamera(
          camera,
          performance.timeOrigin + e.timeStamp,
        )
      }
      prev = e
    }
  })

  canvas.addEventListener('pointerup', () => {
    prev = null
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
