import { Vec2 } from '@sim-v2/math'
import { Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { getContext } from './util.js'

export enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export function initLocalSimulator({
  canvas,
  viewport,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}) {
  const position: Vec2 = new Vec2(100, 100)
  let state: SimulatorState = SimulatorState.Stopped

  return {
    start(): void {
      invariant(state === SimulatorState.Stopped)
      state = SimulatorState.Started

      const context = getContext(canvas)
      context.scale(viewport.scale, viewport.scale)

      let frames = 0
      let prev = performance.now()
      let elapsed = 0

      function render(time: number) {
        if (state === SimulatorState.Stopped) {
          return
        }

        const delta = time - prev
        prev = time
        elapsed += delta
        if (elapsed >= 1000) {
          console.log('fps', frames)
          elapsed = elapsed - 1000
          frames = 0
        }
        frames += 1

        context.save()

        context.clearRect(
          0,
          0,
          viewport.size.x,
          viewport.size.y,
        )

        const size = new Vec2(100, 100)
        context.translate(position.x, position.y)
        context.translate(size.x / 2, size.y / 2)
        context.rotate(time / 1000)
        context.translate(-size.x / 2, -size.y / 2)
        context.fillStyle = 'blue'
        context.fillRect(0, 0, size.x, size.y)

        context.restore()

        requestAnimationFrame(render)
      }

      requestAnimationFrame(render)
    },

    move({ delta }: { delta: Vec2 }): void {
      position.madd(delta)
    },

    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
  }
}
