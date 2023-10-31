import { Camera, ChunkId, Viewport } from '@sim-v2/types'

export function getVisibleChunkIds({
  camera,
  viewport,
}: {
  camera: Camera
  viewport: Viewport
}): Set<ChunkId> {
  return new Set()
}
