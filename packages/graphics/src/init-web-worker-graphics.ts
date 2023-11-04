import {
  Camera,
  Graphics,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'
import { Chunk, ChunkId } from '@sim-v2/world'
import invariant from 'tiny-invariant'
import {
  InitMessage,
  Message,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
  SyncChunksMessage,
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

  worker.addEventListener(
    'message',
    (e) => {
      const message = e.data as Message
      switch (message.type) {
        case MessageType.ReportStatCallback: {
          switch (message.key) {
            case 'rendered-chunks': {
              callbacks.reportStat(
                message.key,
                message.value,
              )
              break
            }
            case 'fps': {
              callbacks.reportStat(
                message.key,
                message.value,
              )
              break
            }
            case 'input-latency': {
              callbacks.reportStat(
                message.key,
                message.value,
              )
            }
            default: {
              invariant(false)
            }
          }
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
    setViewport(viewport: Viewport): void {
      const message: SetViewportMessage = {
        type: MessageType.SetViewport,
        viewport,
      }
      worker.postMessage(message)
    },
    syncChunks(chunks: Record<ChunkId, Chunk>): void {
      const message: SyncChunksMessage = {
        type: MessageType.SyncChunks,
        chunks,
      }
      worker.postMessage(message)
    },
  }
}
