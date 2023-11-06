import { Viewport } from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import { getMinMaxTileSize } from './util.js'

const lastTileSizeToZoomArgs = {
  tileSize: 0,
  viewportSize: {
    x: 0,
    y: 0,
  },
}

let lastZoom: number = 0

export function tileSizeToZoom(
  tileSize: number,
  viewport: Viewport,
): number {
  //
  // cache the last zoom because the vast majority of calls
  // to this function will happen when the camera position, but
  // not tile size, changes.
  //
  if (
    lastTileSizeToZoomArgs.tileSize === tileSize &&
    lastTileSizeToZoomArgs.viewportSize.x ===
      viewport.size.x &&
    lastTileSizeToZoomArgs.viewportSize.y ===
      viewport.size.y
  ) {
    return lastZoom
  }

  const { minTileSize, maxTileSize } =
    getMinMaxTileSize(viewport)
  const zoom =
    (tileSize - minTileSize) / (maxTileSize - minTileSize)

  lastTileSizeToZoomArgs.tileSize = tileSize
  lastTileSizeToZoomArgs.viewportSize.x = viewport.size.x
  lastTileSizeToZoomArgs.viewportSize.y = viewport.size.y

  return (lastZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM))
}
