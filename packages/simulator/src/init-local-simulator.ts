import { Vec2 } from '@sim-v2/math'
import { InitSimulatorArgs, Simulator } from '@sim-v2/types'
import invariant from 'tiny-invariant'

export enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export function initLocalSimulator({}: Omit<
  InitSimulatorArgs,
  'executor'
>): Simulator {
  const position: Vec2 = new Vec2(100, 100)
  let state: SimulatorState = SimulatorState.Started

  return {
    move(delta): void {
      position.madd(delta)
    },

    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
  }
}
