import {
  Chunk,
  ChunkId,
  Tile,
  TileType,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { GeneratorContext } from './init-generator-context.js'

export function generateChunk({
  chunkId,
  chunkSize,
  generator,
}: {
  chunkId: ChunkId
  chunkSize: number
  generator: GeneratorContext
}): Chunk {
  const tiles: Tile[] = new Array(chunkSize ** 2)

  let i = 0
  for (let y = 0; y < chunkSize; y++) {
    for (let x = 0; x < chunkSize; x++) {
      const tile: Tile = {
        type: generator.random(Object.values(TileType)),
      }
      tiles[i++] = tile
    }
  }

  invariant(tiles.length === chunkSize ** 2)

  return { id: chunkId, tiles }
}
