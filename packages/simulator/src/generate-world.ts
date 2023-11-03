import { World, WorldId } from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { generateChunk } from './generate-chunk.js'
import {
  GeneratorContext,
  initGeneratorContext,
} from './init-generator-context.js'

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
  const chunks = generateInitialChunks({
    radius: INITIAL_CHUNK_RADIUS,
    chunkSize,
    generator,
  })

  return {
    id,
    seed,
    tickDuration,
    chunkSize,
    tick: 0,
    chunks,
  }
}

function generateInitialChunks({
  radius,
  chunkSize,
  generator,
}: {
  radius: number
  chunkSize: number
  generator: GeneratorContext
}): World['chunks'] {
  const chunks: World['chunks'] = {}
  for (let x = -radius; x < radius; x++) {
    for (let y = -radius; y < radius; y++) {
      const chunkId = `${x}.${y}`
      invariant(!chunks[chunkId])
      chunks[chunkId] = generateChunk({
        chunkId,
        chunkSize,
        generator,
      })
    }
  }
  return chunks
}
