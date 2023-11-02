import { memo, random } from '@sim-v2/util'
import {
  Chunk,
  ChunkId,
  Tile,
  TileType,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'

const getRandomTile = memo((_key: string): Tile => {
  return {
    type: random(Object.values(TileType)),
  }
})

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
      tiles[i++] = getRandomTile(`${chunkId}.${x}.${y}`)
    }
  }

  invariant(tiles.length === chunkSize ** 2)

  return { id: chunkId, tiles }
}
