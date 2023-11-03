import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  InitSimulatorArgs,
  InitSimulatorFn,
  Simulator,
} from '@sim-v2/types'
import {
  WorldUpdate,
  WorldUpdateType,
  applyWorldUpdates,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { generateWorld } from './generate-world.js'
import { initGeneratorContext } from './init-generator-context.js'

export const initLocalSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = async ({ viewport }) => {
  const id = 'test'
  const seed = `${0}`
  const generator = initGeneratorContext(seed)
  const world = generateWorld({ id, seed, generator })

  const controller = new AbortController()
  const { signal } = controller

  let started: boolean = false
  let interval: number | undefined

  const start: Simulator['start'] = () => {
    invariant(started === false)
    started = true
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
    setCamera(camera): void {
      const visibleChunkIds = getVisibleChunkIds({
        camera,
        viewport,
        chunkSize: world.chunkSize,
      })

      for (const chunkId of visibleChunkIds) {
        if (!world.chunks[chunkId]) {
        }
      }
    },
    setViewport() {
      invariant(false, 'TODO')
    },
    logWorld() {
      console.log(world)
    },
  }
}
