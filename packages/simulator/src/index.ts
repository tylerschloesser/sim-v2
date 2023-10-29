import { Vec2 } from '@sim-v2/math'
import { Viewport } from '@sim-v2/types'
import { getContext } from './util.js'

export class Simulator {
  private canvas: OffscreenCanvas | HTMLCanvasElement
  private viewport: Viewport

  private position: Vec2 = new Vec2(100, 100)

  private constructor({
    canvas,
    viewport,
  }: {
    canvas: OffscreenCanvas | HTMLCanvasElement
    viewport: Viewport
  }) {
    this.canvas = canvas
    this.viewport = viewport
  }

  static async init({
    canvas,
    viewport,
  }: {
    canvas: OffscreenCanvas | HTMLCanvasElement
    viewport: Viewport
  }): Promise<Simulator> {
    return new Simulator({ canvas, viewport })
  }

  start(): void {
    const context = getContext(this.canvas)
    context.scale(this.viewport.scale, this.viewport.scale)

    const simulator = this

    let frames = 0
    let prev = performance.now()
    let elapsed = 0

    function render(time: number) {
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

  // constructor() {
  //   self.addEventListener('message', (ev) => {
  //     const message = ev.data as AppToEngineMessage

  //     switch (message.type) {
  //       case AppToEngineMessageType.Connect: {
  //         this.connected = true
  //         this.canvas = message.canvas
  //         this.viewport = {
  //           size: new Vec2(message.viewport.size),
  //           scale: message.viewport.scale,
  //         }
  //         const response: ConnectSuccessEngineToAppMessage =
  //           {
  //             type: EngineToAppMessageType.ConnectSuccess,
  //           }
  //         self.postMessage(response)
  //         break
  //       }
  //       case AppToEngineMessageType.Move: {
  //         invariant(this.connected)
  //         invariant(this.canvas)

  //         this.position.madd(message.delta)

  //         break
  //       }
  //       case AppToEngineMessageType.CreateWorld: {
  //         invariant(this.world === null)
  //         invariant(this.connected)
  //         invariant(this.canvas)
  //         console.log('todo create world')

  //         this.world = true

  //         break
  //       }
  //     }
  //   })
  // }
}
