import { Graphics, InitGraphicsArgs } from '@sim-v2/types'
import {
  InitMessage,
  MessageType,
  StopMessage,
  UpdatePositionMessage,
} from './web-worker-message.js'

export function initWebWorkerGraphics(
  args: Omit<InitGraphicsArgs, 'executor' | 'canvas'> & {
    canvas: OffscreenCanvas
  },
): Graphics {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const init: InitMessage = {
    type: MessageType.Init,
    payload: args,
  }

  worker.postMessage(init, [init.payload.canvas])

  return {
    stop() {
      const message: StopMessage = {
        type: MessageType.Stop,
      }
      worker.postMessage(message)
      // TODO worker.terminate()
    },
    updatePosition(delta) {
      const message: UpdatePositionMessage = {
        type: MessageType.UpdatePosition,
        payload: { delta },
      }
      worker.postMessage(message)
    },
  }
}
