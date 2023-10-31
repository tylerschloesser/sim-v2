import { Vec2 } from '@sim-v2/math'
import { Graphics } from '@sim-v2/types'

export interface CameraV2 {
  move(delta: Vec2): void
}

export function initCamera({
  graphics,
}: {
  graphics: Graphics
}): CameraV2 {
  return {
    move(delta: Vec2) {
      graphics.move(delta)
    },
  }
}
