import {
  AppToWorkerMessage,
  AppToWorkerMessageType,
  ConnectSuccessWorkerToAppMessage,
  WorkerToAppMessageType,
} from '@sim-v2/api'
import invariant from 'tiny-invariant'

class Worker {
  private connected: boolean = false
  private canvas: OffscreenCanvas | null = null

  constructor() {
    self.addEventListener('message', (ev) => {
      const message = ev.data as AppToWorkerMessage

      switch (message.type) {
        case AppToWorkerMessageType.Connect: {
          this.connected = true
          this.canvas = message.canvas
          const response: ConnectSuccessWorkerToAppMessage =
            {
              type: WorkerToAppMessageType.ConnectSuccess,
            }
          self.postMessage(response)
          break
        }
        case AppToWorkerMessageType.CreateWorld: {
          invariant(this.connected)
          invariant(this.canvas)
          console.log('todo create world')

          const context = this.canvas.getContext('2d')
          const worker = this

          function render(time: number) {
            invariant(context)
            invariant(worker.canvas)

            context.clearRect(
              0,
              0,
              worker.canvas.width,
              worker.canvas.height,
            )

            context.translate(50, 50)
            context.rotate(time / 1000)
            context.translate(-50, -50)
            context.fillStyle = 'blue'
            context.fillRect(0, 0, 100, 100)
            context.resetTransform()

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
