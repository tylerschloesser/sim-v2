import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import {
  GraphicsStrategy,
  Simulator,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'

export enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export function initLocalSimulator({
  canvas,
  viewport,
  graphicsStrategy,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
  graphicsStrategy: GraphicsStrategy
}): Simulator {
  const position: Vec2 = new Vec2(100, 100)
  let state: SimulatorState = SimulatorState.Stopped
  const graphics = initGraphics({
    strategy: graphicsStrategy,
    canvas,
    viewport,
  })

  return {
    start(): void {
      invariant(state === SimulatorState.Stopped)
      state = SimulatorState.Started
    },

    move(delta): void {
      position.madd(delta)
      graphics.updatePosition(delta)
    },

    stop(): void {
      invariant(state === SimulatorState.Started)
      graphics.stop()
      state = SimulatorState.Stopped
    },
  }
}
