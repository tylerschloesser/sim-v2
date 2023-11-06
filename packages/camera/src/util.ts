import { Viewport } from '@sim-v2/types'
import {
  MAX_TILE_SIZE_FACTOR,
  MIN_TILE_SIZE_FACTOR,
} from './const.js'

export function getMinMaxTileSize(viewport: Viewport) {
  return {
    minTileSize:
      Math.min(viewport.size.x, viewport.size.y) *
      MIN_TILE_SIZE_FACTOR,
    maxTileSize:
      Math.min(viewport.size.x, viewport.size.y) *
      MAX_TILE_SIZE_FACTOR,
  }
}
