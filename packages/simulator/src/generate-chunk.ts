import {
  Chunk,
  ChunkId,
  Tile,
  TileType,
  getPosition,
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
  const position = getPosition(chunkId, chunkSize)

  let i = 0
  for (let y = 0; y < chunkSize; y++) {
    for (let x = 0; x < chunkSize; x++) {
      const scale = 0.05
      const noise = generator.noise(
        (position.x + x) * scale,
        (position.y + y) * scale,
        1,
      )

      let type: TileType
      if (noise < 0.33) {
        type = TileType.GrassDark
      } else if (noise < 0.66) {
        type = TileType.GrassMedium
      } else {
        type = TileType.GrassLight
      }

      const tile: Tile = { type }
      tiles[i++] = tile
    }
  }

  invariant(tiles.length === chunkSize ** 2)

  return { id: chunkId, tiles }
}
