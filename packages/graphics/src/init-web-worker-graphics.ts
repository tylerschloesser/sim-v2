import {
  Camera,
  Graphics,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'
import {
  InitMessage,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
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
    ...args,
  }

  worker.postMessage(init, [
    init.canvas,
    init.simulatorPort,
  ])

  return {
    stop() {
      worker.terminate()
    },
    setCamera(camera: Camera) {
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
