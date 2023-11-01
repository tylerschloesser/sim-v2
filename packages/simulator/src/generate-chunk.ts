import { random } from '@sim-v2/math'
import {
  Chunk,
  ChunkId,
  Tile,
  TileType,
} from '@sim-v2/world'
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
      tiles[i++] = {
        type: random(Object.values(TileType)),
      }
    }
  }

  invariant(tiles.length === chunkSize ** 2)

  return { id: chunkId, tiles }
}
