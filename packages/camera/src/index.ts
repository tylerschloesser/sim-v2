import { SimpleVec2, Vec2 } from '@sim-v2/math'
import { Graphics, Viewport } from '@sim-v2/types'

export interface CameraV2 {
  move(delta: Vec2): void
  zoom(delta: number): void
}

export interface CameraSettings {
  position: SimpleVec2
  zoom: number
}

export function initCamera({
  graphics,
  viewport,
  settings,
}: {
  graphics: Graphics
  viewport: Viewport
  settings: CameraSettings
}): CameraV2 {
  const minTileSize =
    Math.min(viewport.size.x, viewport.size.y) * 0.1
  const maxTileSize =
    Math.min(viewport.size.x, viewport.size.y) * 0.5

  console.log({
    minTileSize,
    maxTileSize,
  })

  return {
    move(delta: Vec2) {
      // TODO update settings
      graphics.move(delta)
    },
    zoom(delta: number) {},
  }
}
