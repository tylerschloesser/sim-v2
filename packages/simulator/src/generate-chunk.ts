import { clamp } from '@sim-v2/util'
import {
  Chunk,
  ChunkId,
  Tile,
  TileType,
  getPosition,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { GeneratorContext } from './init-generator-context.js'

const SAMPLES = [
  {
    scale: 1 / 128,
    octave: 1,
    weight: 1,
  },
  {
    scale: 1 / 32,
    octave: 2,
    weight: 1 / 4,
  },
  {
    scale: 1 / 8,
    octave: 3,
    weight: 1 / 32,
  },
]

const totalWeight = SAMPLES.reduce(
  (acc, { weight }) => acc + weight,
  0,
)
invariant(totalWeight > 0)

SAMPLES.forEach((sample) => {
  sample.weight /= totalWeight
})

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
      let noise: number = 0
      for (const { scale, octave, weight } of SAMPLES) {
        noise +=
          generator.noise(
            (position.x + x) * scale,
            (position.y + y) * scale,
            octave,
          ) * weight
      }
      noise = clamp(noise, 0, 1)

      // noise = noise ** 1.5
      // noise = 1 - (1 - noise) ** 1.125

      let type: TileType
      if (noise < 0.25) {
        type = TileType.WaterDeep
      } else if (noise < 0.3) {
        type = TileType.WaterShallow
      } else if (noise < 0.35) {
        type = TileType.Sand
      } else if (noise < 0.55) {
        type = TileType.GrassLight
      } else if (noise < 0.75) {
        type = TileType.GrassMedium
      } else {
        type = TileType.GrassDark
      }

      const tile: Tile = { type }
      tiles[i++] = tile
    }
  }

  invariant(tiles.length === chunkSize ** 2)

  return { id: chunkId, tiles }
}
