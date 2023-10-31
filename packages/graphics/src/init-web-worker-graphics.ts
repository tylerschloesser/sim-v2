import { SimpleVec2 } from '@sim-v2/math'
import { Graphics, InitGraphicsArgs } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import {
  InitMessage,
  MessageType,
  MoveMessage,
  ZoomMessage,
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
      worker.terminate()
    },
    move(delta: SimpleVec2) {
      const message: MoveMessage = {
        type: MessageType.Move,
        payload: { delta },
      }
      worker.postMessage(message)
    },
    zoom(delta: number) {
      const message: ZoomMessage = {
        type: MessageType.Zoom,
        payload: { delta },
      }
      worker.postMessage(message)
    },
  }
}
