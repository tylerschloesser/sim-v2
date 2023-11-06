import { Viewport } from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import { getMinMaxTileSize } from './util.js'

export function tileSizeToZoom(
  tileSize: number,
  viewport: Viewport,
): number {
  const { minTileSize, maxTileSize } =
    getMinMaxTileSize(viewport)
  const zoom =
    (tileSize - minTileSize) / (maxTileSize - minTileSize)
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM)
}
