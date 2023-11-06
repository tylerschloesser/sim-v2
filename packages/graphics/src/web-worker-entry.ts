import { Vec2 } from '@sim-v2/math'
import { Graphics, InitGraphicsArgs } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initLocalGraphics } from './init-local-graphics.js'
import {
  Message,
  MessageType,
  ReportStatCallbackMessage,
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
    case MessageType.SetCameraMotion: {
      invariant(graphics)
      graphics.setCameraMotion()
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
    case MessageType.SyncChunk: {
      invariant(graphics)
      const { chunk } = message
      graphics.syncChunk(chunk)
      break
    }
    default: {
      invariant(false)
    }
  }
})

function initCallbacks(): InitGraphicsArgs['callbacks'] {
  return {
    reportStat(stat) {
      const message: ReportStatCallbackMessage = {
        type: MessageType.ReportStatCallback,
        stat,
      }
      self.postMessage(message)
    },
  }
}
