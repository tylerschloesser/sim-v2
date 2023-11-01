import { Camera, Viewport } from '@sim-v2/types'
import { ChunkId } from '@sim-v2/world'

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
