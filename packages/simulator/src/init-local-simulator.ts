import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
} from '@sim-v2/types'
import {
  WorldUpdate,
  WorldUpdateType,
  applyWorldUpdates,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { generateWorld } from './generate-world.js'

export const initLocalSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = async ({ ...args }) => {
  let { camera, viewport } = args

  const world = generateWorld({
    id: 'test',
    seed: `${0}`,
  })

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
