import {
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
> = () => {
  let state: SimulatorState = SimulatorState.Started

  return {
    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
    setCamera() {
      invariant(false, 'TODO')
    },
    setViewport() {
      invariant(false, 'TODO')
    },
  }
}
