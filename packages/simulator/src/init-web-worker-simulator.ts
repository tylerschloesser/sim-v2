import { Vec2 } from '@sim-v2/math'
import {
  InitMessage,
  MessageType,
  MoveMessage,
  StartMessage,
  StopMessage,
} from './web-worker-message.js'

export function initWebWorkerSimulator(
  args: InitMessage['payload'],
) {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const message: InitMessage = {
    type: MessageType.Init,
    payload: args,
  }

  worker.postMessage(message, [message.payload.canvas])

  return {
    start(): void {
      const message: StartMessage = {
        type: MessageType.Start,
      }
      worker.postMessage(message)
    },
    move(args: { delta: Vec2 }): void {
      const message: MoveMessage = {
        type: MessageType.Move,
        payload: args,
      }
      worker.postMessage(message)
    },
    stop(): void {
      const message: StopMessage = {
        type: MessageType.Stop,
      }
      worker.postMessage(message)
    },
  }
}
