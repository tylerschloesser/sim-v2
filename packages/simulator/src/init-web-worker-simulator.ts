import { InitSimulatorArgs, Simulator } from '@sim-v2/types'
import {
  InitMessage,
  MessageType,
  MoveMessage,
} from './web-worker-message.js'

export function initWebWorkerSimulator(
  args: Omit<InitSimulatorArgs, 'executor'>,
): Simulator {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const init: InitMessage = {
    type: MessageType.Init,
    payload: args,
  }

  worker.postMessage(init)

  return {
    move(args): void {
      const message: MoveMessage = {
        type: MessageType.Move,
        payload: {
          delta: args,
        },
      }
      worker.postMessage(message)
    },
    stop(): void {
      worker.terminate()
    },
  }
}
