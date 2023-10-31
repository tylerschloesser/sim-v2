import {
  InitSimulatorArgs,
  InitSimulatorFn,
} from '@sim-v2/types'
import {
  InitMessage,
  MessageType,
} from './web-worker-message.js'

export const initWebWorkerSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = (args) => {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const init: InitMessage = {
    type: MessageType.Init,
    ...args,
  }

  worker.postMessage(init)

  return {
    stop(): void {
      worker.terminate()
    },
  }
}
