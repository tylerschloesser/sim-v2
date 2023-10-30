import { InitSimulatorArgs, Simulator } from '@sim-v2/types'
import invariant from 'tiny-invariant'

export enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export function initLocalSimulator({
  camera,
}: Omit<InitSimulatorArgs, 'executor'>): Simulator {
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
