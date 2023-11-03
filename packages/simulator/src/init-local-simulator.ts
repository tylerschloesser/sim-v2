import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
} from '@sim-v2/types'
import {
  World,
  WorldUpdate,
  WorldUpdateType,
  applyWorldUpdates,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { generateChunk } from './generate-chunk.js'
import { initGeneratorContext } from './init-generator-context.js'

export const initLocalSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = async ({ ...args }) => {
  let { camera, viewport } = args

  const world: World = {
    seed: `${0}`,
    tickDuration: 100,
    chunkSize: 32,
    tick: 0,
    chunks: {},
  }

  const generator = initGeneratorContext(world.seed)

  const controller = new AbortController()
  const { signal } = controller

  const interval = setInterval(() => {
    const updates: WorldUpdate[] = []

    updates.push({
      type: WorldUpdateType.Tick,
      tick: world.tick + 1,
    })

    applyWorldUpdates(world, updates)
  }, world.tickDuration)

  signal.addEventListener('abort', () => {
    clearInterval(interval)
  })

  let visibleChunkIds = getVisibleChunkIds({
    camera,
    viewport,
  })

  for (const chunkId of visibleChunkIds) {
    if (!world.chunks[chunkId]) {
      world.chunks[chunkId] = generateChunk({
        chunkId,
        chunkSize: world.chunkSize,
        generator,
      })
    }
  }

  return {
    world,
    stop(): void {
      controller.abort()
    },
    setCamera(next: Camera): void {
      camera = next
    },
    setViewport() {
      invariant(false, 'TODO')
    },
    logWorld() {
      console.log(world)
    },
  }
}
