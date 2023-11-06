import {
  clampTileSize,
  clampZoom,
  tileSizeToZoom,
  zoomToTileSize,
} from '@sim-v2/camera'
import { Vec2 } from '@sim-v2/math'
import { Camera } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { PointerMotion } from './pointer-motion.js'
import {
  GetTileSizeFn,
  GetViewportFn,
  SetCameraFn,
} from './types.js'

type PointerId = number

const pointerCache = new Map<PointerId, PointerEvent>()

const motion = new PointerMotion(10)

function getOtherPointer(e: PointerEvent) {
  invariant(pointerCache.size === 2)
  for (const other of pointerCache.values()) {
    if (other.pointerId !== e.pointerId) {
      return other
    }
  }
  invariant(false)
}

type HandlePointerFn = (args: {
  prev: PointerEvent
  next: PointerEvent
}) => void

export function initCanvasEventListeners({
  canvas,
  camera,
  setCamera,
  getViewport,
  getTileSize,
  signal,
}: {
  canvas: HTMLCanvasElement
  camera: Camera
  setCamera: SetCameraFn
  getViewport: GetViewportFn
  getTileSize: GetTileSizeFn
  signal: AbortSignal
}): void {
  const handlePointerOne: HandlePointerFn = ({
    prev,
    next,
  }) => {
    const tileSize = getTileSize()

    const dx = (prev.clientX - next.clientX) / tileSize
    const dy = (prev.clientY - next.clientY) / tileSize

    camera.position.x += dx
    camera.position.y += dy

    motion.push(dx, dy, next.timeStamp)

    setCamera(
      camera,
      performance.timeOrigin + next.timeStamp,
    )
  }

  const handlePointerTwo: HandlePointerFn = ({
    prev,
    next,
  }) => {
    const other = getOtherPointer(next)
    if (!other.buttons) {
      return
    }

    const v = {
      other: new Vec2(other.clientX, other.clientY),
      prev: new Vec2(prev.clientX, prev.clientY),
      next: new Vec2(next.clientX, next.clientY),
    }

    const center = {
      prev: v.other.add(v.prev.sub(v.other).div(2)),
      next: v.other.add(v.next.sub(v.other).div(2)),
    }

    const dist = {
      prev: v.other.sub(v.prev).len(),
      next: v.other.sub(v.next).len(),
    }

    const viewport = getViewport()
    const tileSize = {
      prev: zoomToTileSize(camera.zoom, viewport),
      next: clampTileSize(
        zoomToTileSize(camera.zoom, viewport) *
          (dist.next / dist.prev),
        viewport,
      ),
    }

    const move = center.next
      .sub(center.prev)
      .mul(-1)
      .div(tileSize.next)

    const anchor = center.next.sub(viewport.size.div(2))
    const adjust = anchor
      .div(tileSize.prev)
      .sub(anchor.div(tileSize.next))
      .add(move)

    camera.position.x += adjust.x
    camera.position.y += adjust.y
    camera.zoom = tileSizeToZoom(tileSize.next, viewport)

    setCamera(
      camera,
      performance.timeOrigin + next.timeStamp,
    )
  }

  canvas.addEventListener(
    'pointermove',
    (e) => {
      const prev = pointerCache.get(e.pointerId)
      pointerCache.set(e.pointerId, e)

      if (!e.buttons || !prev?.buttons) {
        return
      }

      switch (pointerCache.size) {
        case 1: {
          handlePointerOne({ prev, next: e })
          break
        }
        case 2: {
          handlePointerTwo({ prev, next: e })
          break
        }
      }
    },
    { signal },
  )

  canvas.addEventListener(
    'pointerup',
    (e) => {
      console.log('velocity?', motion.getVelocity(100))
      pointerCache.delete(e.pointerId)
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerout',
    (e) => {
      pointerCache.delete(e.pointerId)
    },
    { signal },
  )
  canvas.addEventListener(
    'pointerleave',
    (e) => {
      pointerCache.delete(e.pointerId)
    },
    { signal },
  )

  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') {
        pointerCache.clear()
      }
    },
    { signal },
  )

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()

      const viewport = getViewport()
      const scale =
        viewport.size.y * (1 + (1 - camera.zoom)) * 1

      const zoom = {
        prev: camera.zoom,
        next: clampZoom(camera.zoom + -e.deltaY / scale),
      }

      if (zoom.prev === zoom.next) {
        return
      }

      const anchor = new Vec2(e.clientX, e.clientY).sub(
        viewport.size.div(2),
      )
      const adjust = anchor
        .div(zoomToTileSize(zoom.prev, viewport))
        .sub(
          anchor.div(zoomToTileSize(zoom.next, viewport)),
        )

      camera.position.x += adjust.x
      camera.position.y += adjust.y
      camera.zoom = zoom.next

      setCamera(
        camera,
        performance.timeOrigin + e.timeStamp,
      )
    },
    { passive: false, signal },
  )
}
