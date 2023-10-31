import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
  Viewport,
} from '@sim-v2/types'
import {
  InitMessage,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
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

  worker.postMessage(init, [init.graphicsPort])

  return {
    stop(): void {
      worker.terminate()
    },
    setCamera(camera: Camera): void {
      const message: SetCameraMessage = {
        type: MessageType.SetCamera,
        camera,
      }
      worker.postMessage(message)
    },
    setViewport(viewport: Viewport): void {
      const message: SetViewportMessage = {
        type: MessageType.SetViewport,
        viewport,
      }
      worker.postMessage(message)
    },
  }
}
