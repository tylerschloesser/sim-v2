import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  InitSimulatorArgs,
  InitSimulatorFn,
  Simulator,
} from '@sim-v2/types'
import {
  Chunk,
  ChunkId,
  WorldUpdate,
  WorldUpdateType,
  applyWorldUpdates,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { generateChunk } from './generate-chunk.js'
import { generateWorld } from './generate-world.js'
import { initGeneratorContext } from './init-generator-context.js'

export const initLocalSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = async ({ viewport, callbacks, ...args }) => {
  const id = 'test'
  const seed = `${0}`
  const generator = initGeneratorContext(seed)
  const world = generateWorld({ id, seed, generator })
  const { chunkSize } = world

  const syncChunksListeners: ((
    chunks: Record<ChunkId, Chunk>,
  ) => void)[] = []

  const controller = new AbortController()
  const { signal } = controller

  let started: boolean = false
  let interval: number | undefined

  const setCamera: Simulator['setCamera'] = (camera) => {
    const visibleChunkIds = getVisibleChunkIds({
      camera,
      viewport,
      chunkSize,
    })

    const sync: Record<ChunkId, Chunk> = {}

    for (const chunkId of visibleChunkIds) {
      if (!world.chunks[chunkId]) {
        const chunk = generateChunk({
          chunkId,
          chunkSize,
          generator,
        })
        world.chunks[chunkId] = chunk
        sync[chunkId] = chunk
      }
    }

    if (Object.values(sync).length > 0) {
      for (const syncChunks of syncChunksListeners) {
        syncChunks(sync)
      }
      callbacks.syncChunks(sync)
    }
  }

  const start: Simulator['start'] = () => {
    invariant(started === false)
    started = true

    // send the initial chunks
    setCamera(args.camera)

    interval = self.setInterval(() => {
      const updates: WorldUpdate[] = []

      updates.push({
        type: WorldUpdateType.Tick,
        tick: world.tick + 1,
      })

      applyWorldUpdates(world, updates)
    }, world.tickDuration)
  }

  signal.addEventListener('abort', () => {
    self.clearInterval(interval)
  })

  return {
    world,
    start,
    stop(): void {
      controller.abort()
    },
    setCamera,
    setViewport() {
      invariant(false, 'TODO')
    },
    logWorld() {
      console.log(world)
    },
    addSyncChunksListener(listener) {
      syncChunksListeners.push(listener)
    },
  }
}
