import { Camera, Viewport } from '@sim-v2/types'
import { ChunkId } from '@sim-v2/world'
import invariant from 'tiny-invariant'

export function getVisibleChunkIds({
  camera,
  viewport,
}: {
  camera: Camera
  viewport: Viewport
}): Set<ChunkId> {
  const chunkIds = new Set<ChunkId>()
  for (let y = -1; y <= 0; y++) {
    for (let x = -1; x <= 0; x++) {
      chunkIds.add(`${x}.${y}`)
    }
  }
  return chunkIds
}

// as a function of the smallest viewport dimension
//
const MIN_TILE_SIZE_FACTOR = 1 / 64
const MAX_TILE_SIZE_FACTOR = 1 / 4

export function getTileSize(
  camera: Camera,
  viewport: Viewport,
): number {
  const minTileSize =
    Math.min(viewport.size.x, viewport.size.y) *
    MIN_TILE_SIZE_FACTOR
  const maxTileSize =
    Math.min(viewport.size.x, viewport.size.y) *
    MAX_TILE_SIZE_FACTOR

  invariant(camera.zoom >= 0)
  invariant(camera.zoom <= 1)

  return (
    minTileSize + (maxTileSize - minTileSize) * camera.zoom
  )
}
