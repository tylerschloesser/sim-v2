import { Vec2 } from '@sim-v2/math'
import { Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { getContext } from './util.js'

export interface InitArgs {
  canvas: OffscreenCanvas | HTMLCanvasElement
  viewport: Viewport
}

export interface ISimulator {
  start(): void
  move(args: { delta: Vec2 }): void
  stop(): void
}

enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export class Simulator implements ISimulator {
  private canvas: OffscreenCanvas | HTMLCanvasElement
  private viewport: Viewport
  private position: Vec2 = new Vec2(100, 100)
  private state: SimulatorState = SimulatorState.Stopped

  constructor({ canvas, viewport }: InitArgs) {
    this.canvas = canvas
    this.viewport = viewport
  }

  start(): void {
    invariant(this.state === SimulatorState.Stopped)
    this.state = SimulatorState.Started

    const context = getContext(this.canvas)
    context.scale(this.viewport.scale, this.viewport.scale)

    const simulator = this

    let frames = 0
    let prev = performance.now()
    let elapsed = 0

    function render(time: number) {
      if (simulator.state === SimulatorState.Stopped) {
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
        simulator.viewport.size.x,
        simulator.viewport.size.y,
      )

      const size = new Vec2(100, 100)
      context.translate(
        simulator.position.x,
        simulator.position.y,
      )
      context.translate(size.x / 2, size.y / 2)
      context.rotate(time / 1000)
      context.translate(-size.x / 2, -size.y / 2)
      context.fillStyle = 'blue'
      context.fillRect(0, 0, size.x, size.y)

      context.restore()

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  }

  move({ delta }: { delta: Vec2 }): void {
    this.position.madd(delta)
  }

  stop(): void {
    invariant(this.state === SimulatorState.Started)
    this.state = SimulatorState.Stopped
  }
}
