import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  Camera,
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
> = ({ graphicsPort, ...args }) => {
  let state: SimulatorState = SimulatorState.Started
  let { camera, viewport } = args

  let visibleChunkIds = getVisibleChunkIds({
    camera,
    viewport,
  })

  console.log('testing message')
  graphicsPort.postMessage('test')

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
