import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
  Viewport,
} from '@sim-v2/types'
import {
  InitMessage,
  LogWorldMessage,
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

  worker.postMessage(init, [
    init.graphicsPort,
    init.appPort,
  ])

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
    logWorld(): void {
      const message: LogWorldMessage = {
        type: MessageType.LogWorld,
      }
      worker.postMessage(message)
    },
  }
}
