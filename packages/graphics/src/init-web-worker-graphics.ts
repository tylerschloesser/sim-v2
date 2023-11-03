import {
  Camera,
  Graphics,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import {
  CallbackMessage,
  CallbackMessageType,
  InitMessage,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
} from './web-worker-message.js'

export function initWebWorkerGraphics({
  callbacks,
  ...args
}: Omit<
  InitGraphicsArgs<OffscreenCanvas>,
  'executor'
>): Graphics {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const controller = new AbortController()
  const { signal } = controller

  const init: InitMessage = {
    type: MessageType.Init,
    ...args,
  }

  worker.postMessage(init, [
    init.canvas,
    init.simulatorPort,
    init.appPort,
  ])

  worker.addEventListener(
    'message',
    (e) => {
      const message = e.data as CallbackMessage
      switch (message.type) {
        case CallbackMessageType.ReportFps: {
          callbacks?.reportFps?.(message.fps)
          break
        }
        case CallbackMessageType.ReportInputLatency: {
          callbacks?.reportInputLatency?.(
            message.inputLatency,
          )
          break
        }
        default: {
          invariant(false)
        }
      }
    },
    { signal },
  )

  signal.addEventListener('abort', () => {
    worker.terminate()
  })

  return {
    stop() {
      controller.abort()
    },
    setCamera(camera: Camera, time: number) {
      const message: SetCameraMessage = {
        type: MessageType.SetCamera,
        camera,
        time,
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
