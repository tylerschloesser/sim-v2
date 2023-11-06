import { Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import { getMinMaxTileSize } from './util.js'

const lastZoomToTileSizeArgs = {
  zoom: 0,
  viewportSize: {
    x: 0,
    y: 0,
  },
}

let lastTileSize: number = 0

export function zoomToTileSize(
  zoom: number,
  viewport: Viewport,
): number {
  //
  // cache the last tile size because the vast majority of calls
  // to this function will happen when the camera position, but
  // not zoom, changes.
  //
  if (
    lastZoomToTileSizeArgs.zoom === zoom &&
    lastZoomToTileSizeArgs.viewportSize.x ===
      viewport.size.x &&
    lastZoomToTileSizeArgs.viewportSize.y ===
      viewport.size.y
  ) {
    return lastTileSize
  }

  const { minTileSize, maxTileSize } =
    getMinMaxTileSize(viewport)

  invariant(zoom >= MIN_ZOOM)
  invariant(zoom <= MAX_ZOOM)

  lastZoomToTileSizeArgs.zoom = zoom
  lastZoomToTileSizeArgs.viewportSize.x = viewport.size.x
  lastZoomToTileSizeArgs.viewportSize.y = viewport.size.y

  return (lastTileSize =
    minTileSize + (maxTileSize - minTileSize) * zoom)
}
