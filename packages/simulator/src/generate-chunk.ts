import { Chunk, ChunkId, Tile } from '@sim-v2/types'
import invariant from 'tiny-invariant'

export function generateChunk({
  chunkId,
  chunkSize,
}: {
  chunkId: ChunkId
  chunkSize: number
}): Chunk {
  const tiles: Tile[] = new Array(chunkSize ** 2)

  let i = 0
  for (let y = 0; y < chunkSize; y++) {
    for (let x = 0; x < chunkSize; x++) {
      tiles[i++] = {}
    }
  }

  invariant(tiles.length === chunkSize ** 2)

  return { id: chunkId, tiles }
}