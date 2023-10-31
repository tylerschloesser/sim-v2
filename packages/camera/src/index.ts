import { Vec2 } from '@sim-v2/math'
import { Graphics, Viewport } from '@sim-v2/types'

export interface CameraV2 {
  move(delta: Vec2): void
}

export function initCamera({
  graphics,
  viewport,
  position,
  zoom,
}: {
  graphics: Graphics
  viewport: Viewport
  position: Vec2
  zoom: number
}): CameraV2 {
  return {
    move(delta: Vec2) {
      graphics.move(delta)
    },
  }
}
