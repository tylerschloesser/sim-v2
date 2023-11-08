import {
  Camera,
  Graphics,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import {
  InitMessage,
  Message,
  MessageType,
  SetCameraMessage,
  SetCameraMotionMessage,
  SetViewportMessage,
  SyncChunkMessage,
} from './web-worker-message.js'

export function initWebWorkerGraphics({
  callbacks,
  ...args
}: InitGraphicsArgs<OffscreenCanvas>): Graphics {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const controller = new AbortController()
  const { signal } = controller

  worker.addEventListener(
    'message',
    (e) => {
      const message = e.data as Message
      switch (message.type) {
        case MessageType.ReportStatCallback: {
          callbacks.reportStat(message.stat)
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

  const init: InitMessage = {
    type: MessageType.Init,
    ...args,
  }

  worker.postMessage(init, [init.canvas])

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
    setCameraMotion() {
      const message: SetCameraMotionMessage = {
        type: MessageType.SetCameraMotion,
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
    syncChunk(chunk, index): void {
      const message: SyncChunkMessage = {
        type: MessageType.SyncChunk,
        chunk,
        index,
      }
      worker.postMessage(message)
    },
  }
}
