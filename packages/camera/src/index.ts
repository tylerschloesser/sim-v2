import { Camera, Viewport } from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import { ChunkId } from '@sim-v2/world'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import { getMinMaxTileSize } from './util.js'
import { zoomToTileSize } from './zoom-to-tile-size.js'

export { zoomToTileSize } from './zoom-to-tile-size.js'

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

export function clampTileSize(
  tileSize: number,
  viewport: Viewport,
) {
  const { minTileSize, maxTileSize } =
    getMinMaxTileSize(viewport)
  return clamp(tileSize, minTileSize, maxTileSize)
}

export function clampZoom(zoom: number) {
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM)
}
