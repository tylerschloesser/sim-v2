import { Vec2 } from '@sim-v2/math'
import { Camera } from '@sim-v2/types'

export function loadCamera(): Camera<Vec2> {
  return {
    position: new Vec2(0),
    zoom: 0.25,
  }
}

export function saveCamera(camera: Camera<Vec2>): void {}
