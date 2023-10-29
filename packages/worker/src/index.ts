import {
  AppToWorkerMessage,
  AppToWorkerMessageType,
  ConnectSuccessWorkerToAppMessage,
  WorkerToAppMessageType,
} from '@sim-v2/api'
import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

class Worker {
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
      const message = ev.data as AppToWorkerMessage

      switch (message.type) {
        case AppToWorkerMessageType.Connect: {
          this.connected = true
          this.canvas = message.canvas
          this.viewport = {
            size: new Vec2(message.viewport.size),
            scale: message.viewport.scale,
          }
          const response: ConnectSuccessWorkerToAppMessage =
            {
              type: WorkerToAppMessageType.ConnectSuccess,
            }
          self.postMessage(response)
          break
        }
        case AppToWorkerMessageType.Move: {
          invariant(this.connected)
          invariant(this.canvas)

          this.position.madd(message.delta)

          break
        }
        case AppToWorkerMessageType.CreateWorld: {
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

          const worker = this

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
            invariant(worker.canvas)
            invariant(worker.viewport)

            context.save()

            context.clearRect(
              0,
              0,
              worker.viewport.size.x,
              worker.viewport.size.y,
            )

            const size = new Vec2(100, 100)
            context.translate(
              worker.position.x,
              worker.position.y,
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
  new Worker()
}
