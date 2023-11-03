import { World, WorldId } from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { generateChunk } from './generate-chunk.js'
import { initGeneratorContext } from './init-generator-context.js'

const TICK_DURATION = 100
const CHUNK_SIZE = 32
const INITIAL_CHUNK_RADIUS = 2

export function generateWorld({
  id,
  seed,
}: {
  id: WorldId
  seed: string
}): World {
  const generator = initGeneratorContext(seed)

  const tickDuration = TICK_DURATION
  const chunkSize = CHUNK_SIZE

  const chunks: World['chunks'] = {}

  for (
    let x = -INITIAL_CHUNK_RADIUS;
    x < INITIAL_CHUNK_RADIUS;
    x++
  ) {
    for (
      let y = -INITIAL_CHUNK_RADIUS;
      y < INITIAL_CHUNK_RADIUS;
      y++
    ) {
      const chunkId = `${x}.${y}`
      invariant(!chunks[chunkId])
      chunks[chunkId] = generateChunk({
        chunkId,
        chunkSize,
        generator,
      })
    }
  }

  return {
    id,
    seed,
    tickDuration,
    chunkSize,
    tick: 0,
    chunks,
  }
}
