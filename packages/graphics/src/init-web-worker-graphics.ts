import { Vec2 } from '@sim-v2/math'
import {
  Camera,
  Graphics,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import {
  InitMessage,
  MessageType,
  SetCameraMessage,
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
        camera: {
          ...camera,
          position: new Vec2(camera.position),
        },
      }
      worker.postMessage(message)
    },
    setViewport(viewport: Viewport): void {
      invariant(false, 'TODO')
    },
  }
}
