import { Vec2 } from '@sim-v2/math'
import { Graphics, InitGraphicsArgs } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initLocalGraphics } from './init-local-graphics.js'
import {
  Message,
  MessageType,
  ReportFpsCallbackMessage,
  ReportInputLatencyCallbackMessage,
} from './web-worker-message.js'

let graphics: Graphics | null = null

self.addEventListener('message', (e) => {
  const message = e.data as Message
  switch (message.type) {
    case MessageType.Init: {
      invariant(graphics === null)

      const callbacks: InitGraphicsArgs['callbacks'] =
        initCallbacks()

      graphics = initLocalGraphics({
        ...message,
        camera: {
          ...message.camera,
          position: new Vec2(message.camera.position),
        },
        viewport: {
          ...message.viewport,
          size: new Vec2(message.viewport.size),
        },
        callbacks,
      })
      break
    }
    case MessageType.SetCamera: {
      invariant(graphics)
      graphics.setCamera(
        {
          ...message.camera,
          position: new Vec2(message.camera.position),
        },
        message.time,
      )
      break
    }
    case MessageType.SetViewport: {
      invariant(graphics)
      graphics.setViewport({
        ...message.viewport,
        size: new Vec2(message.viewport.size),
      })
      break
    }
    default: {
      invariant(false)
    }
  }
})

function initCallbacks(): InitGraphicsArgs['callbacks'] {
  return {
    reportFps(fps) {
      const message: ReportFpsCallbackMessage = {
        type: MessageType.ReportFpsCallback,
        fps,
      }
      self.postMessage(message)
    },
    reportInputLatency(inputLatency) {
      const message: ReportInputLatencyCallbackMessage = {
        type: MessageType.ReportInputLatencyCallback,
        inputLatency,
      }
      self.postMessage(message)
    },
  }
}
