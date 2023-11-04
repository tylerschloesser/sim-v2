import { Camera, Viewport } from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import { ChunkId } from '@sim-v2/world'
import invariant from 'tiny-invariant'

export function getVisibleChunkIds({
  camera,
  viewport,
  chunkSize,
  chunkIds = new Set(),
}: {
  camera: Camera
  viewport: Viewport
  chunkSize: number
  chunkIds?: Set<ChunkId>
}): Set<ChunkId> {
  chunkIds.clear()

  const tileSize = zoomToTileSize(camera.zoom, viewport)

  const d = viewport.size.div(2).div(tileSize)
  const tl = camera.position.sub(d).div(chunkSize)
  const br = camera.position.add(d).div(chunkSize)

  tl.x = Math.floor(tl.x)
  tl.y = Math.floor(tl.y)

  br.x = Math.ceil(br.x)
  br.y = Math.ceil(br.y)

  for (let y = tl.y; y < br.y; y++) {
    for (let x = tl.x; x < br.x; x++) {
      chunkIds.add(`${x}.${y}`)
    }
  }
  return chunkIds
}

// as a function of the smallest viewport dimension
//
const MIN_TILE_SIZE_FACTOR = 1 / 256
const MAX_TILE_SIZE_FACTOR = 1 / 8

const MIN_ZOOM = 0
const MAX_ZOOM = 1

export function zoomToTileSize(
  zoom: number,
  viewport: Viewport,
): number {
  const { minTileSize, maxTileSize } =
    getMinMaxTileSize(viewport)

  invariant(zoom >= MIN_ZOOM)
  invariant(zoom <= MAX_ZOOM)

  return minTileSize + (maxTileSize - minTileSize) * zoom
}

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

function getMinMaxTileSize(viewport: Viewport) {
  return {
    minTileSize:
      Math.min(viewport.size.x, viewport.size.y) *
      MIN_TILE_SIZE_FACTOR,
    maxTileSize:
      Math.min(viewport.size.x, viewport.size.y) *
      MAX_TILE_SIZE_FACTOR,
  }
}

export function clampTileSize(
  tileSize: number,
  viewport: Viewport,
) {
  const { minTileSize, maxTileSize } =
    getMinMaxTileSize(viewport)
  return clamp(tileSize, minTileSize, maxTileSize)
}
