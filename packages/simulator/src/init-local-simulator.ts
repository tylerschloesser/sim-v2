import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  InitSimulatorArgs,
  InitSimulatorFn,
  Simulator,
  SyncChunksFn,
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

  const syncChunksListeners: SyncChunksFn[] = []

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

    const show = new Set<Chunk>()
    // TODO
    const hide = new Set<ChunkId>()

    for (const chunkId of visibleChunkIds) {
      if (!world.chunks[chunkId]) {
        const chunk = generateChunk({
          chunkId,
          chunkSize,
          generator,
        })
        world.chunks[chunkId] = chunk
        show.add(chunk)
      }
    }

    if (show.size > 0 || hide.size > 0) {
      const args = { show, hide }
      for (const syncChunks of syncChunksListeners) {
        syncChunks(args)
      }
      callbacks.syncChunks(args)
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
