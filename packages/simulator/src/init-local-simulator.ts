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
> = ({ camera }) => {
  let state: SimulatorState = SimulatorState.Started

  return {
    move(delta): void {
      camera.position.madd(delta)
    },

    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
  }
}
