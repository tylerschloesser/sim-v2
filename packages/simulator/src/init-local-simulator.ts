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
  let state: SimulatorState = SimulatorState.Stopped

  return {
    start(): void {
      invariant(state === SimulatorState.Stopped)
      state = SimulatorState.Started
    },

    move(delta): void {
      position.madd(delta)
    },

    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
  }
}
