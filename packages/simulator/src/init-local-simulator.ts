import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  Camera,
  GraphicsUpdate,
  GraphicsUpdateType,
  InitSimulatorArgs,
  InitSimulatorFn,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'

export enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export const initLocalSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = (args) => {
  let state: SimulatorState = SimulatorState.Started
  let { camera, viewport } = args

  let visibleChunkIds = getVisibleChunkIds({
    camera,
    viewport,
  })

  const updates: GraphicsUpdate[] = []
  for (const chunkId of visibleChunkIds) {
    updates.push({
      type: GraphicsUpdateType.NewChunk,
    })
  }

  return {
    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
    setCamera(next: Camera): void {
      camera = next
    },
    setViewport() {
      invariant(false, 'TODO')
    },
  }
}
