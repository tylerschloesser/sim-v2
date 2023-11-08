import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  InitSimulatorArgs,
  InitSimulatorFn,
  Simulator,
  SyncChunkFn,
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

  const syncChunkListeners: SyncChunkFn[] = []

  const controller = new AbortController()
  const { signal } = controller

  let started: boolean = false
  let interval: number | undefined

  const chunkIdToStatus: Record<
    ChunkId,
    { synced: boolean }
  > = {}

  const visibleChunkIds = new Set<ChunkId>()
  const sync = new Set<Chunk>()

  const setCamera: Simulator['setCamera'] = (camera) => {
    getVisibleChunkIds({
      camera,
      viewport,
      chunkSize,
      chunkIds: visibleChunkIds,
    })
    sync.clear()

    for (const chunkId of visibleChunkIds) {
      let chunk = world.chunks[chunkId]
      if (!chunk) {
        chunk = world.chunks[chunkId] = generateChunk({
          chunkId,
          chunkSize,
          generator,
        })
      }

      let status = chunkIdToStatus[chunk.id]
      if (!status) {
        status = chunkIdToStatus[chunk.id] = {
          synced: false,
        }
      }

      if (!status.synced) {
        sync.add(chunk)
        status.synced = true
      }
    }

    if (sync.size) {
      let index = 0
      for (const chunk of sync) {
        for (const syncChunk of syncChunkListeners) {
          syncChunk(chunk, index)
        }
        callbacks.syncChunk(chunk, index)
        index += 1
      }
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
    addSyncChunkListener(listener) {
      syncChunkListeners.push(listener)
    },
  }
}
