import { Vec2 } from '@sim-v2/math'
import {
  Camera,
  Graphics,
  InitGraphicsArgs,
  Viewport,
  GraphicsUpdate,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import {
  InitMessage,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
  UpdateMessage,
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

  worker.postMessage(init, [init.canvas])

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
    update(updates: GraphicsUpdate[]): void {
      const message: UpdateMessage = {
        type: MessageType.Update,
        updates,
      }
    },
  }
}
