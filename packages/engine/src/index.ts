import {
  AppToEngineMessage,
  AppToEngineMessageType,
  ConnectSuccessEngineToAppMessage,
  EngineToAppMessageType,
} from '@sim-v2/api'
import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

class Engine {
  private connected: boolean = false
  private canvas: OffscreenCanvas | null = null
  private world: true | null = null
  private viewport: {
    size: Vec2
    scale: number
  } | null = null
  private position: Vec2 = new Vec2(100, 100)

  constructor() {
    self.addEventListener('message', (ev) => {
      const message = ev.data as AppToEngineMessage

      switch (message.type) {
        case AppToEngineMessageType.Connect: {
          this.connected = true
          this.canvas = message.canvas
          this.viewport = {
            size: new Vec2(message.viewport.size),
            scale: message.viewport.scale,
          }
          const response: ConnectSuccessEngineToAppMessage =
            {
              type: EngineToAppMessageType.ConnectSuccess,
            }
          self.postMessage(response)
          break
        }
        case AppToEngineMessageType.Move: {
          invariant(this.connected)
          invariant(this.canvas)

          this.position.madd(message.delta)

          break
        }
        case AppToEngineMessageType.CreateWorld: {
          invariant(this.world === null)
          invariant(this.connected)
          invariant(this.canvas)
          console.log('todo create world')

          this.world = true

          const context = this.canvas.getContext('2d')
          invariant(context)
          invariant(this.viewport)
          context.scale(
            this.viewport.scale,
            this.viewport.scale,
          )

          const engine = this

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

            invariant(context)
            invariant(engine.canvas)
            invariant(engine.viewport)

            context.save()

            context.clearRect(
              0,
              0,
              engine.viewport.size.x,
              engine.viewport.size.y,
            )

            const size = new Vec2(100, 100)
            context.translate(
              engine.position.x,
              engine.position.y,
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

          break
        }
      }
    })
  }
}

export function main() {
  new Engine()
}
