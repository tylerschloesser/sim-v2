import { Vec2 } from '@sim-v2/math'
import { Graphics } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initLocalGraphics } from './init-local-graphics.js'
import {
  Message,
  MessageType,
} from './web-worker-message.js'

let graphics: Graphics | null = null

self.addEventListener('message', (e) => {
  const message = e.data as Message
  switch (message.type) {
    case MessageType.Init: {
      invariant(graphics === null)
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
      })
      break
    }
    case MessageType.SetCamera: {
      invariant(graphics)
      graphics.setCamera({
        ...message.camera,
        position: new Vec2(message.camera.position),
      })
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
    case MessageType.Update: {
      invariant(graphics)
      graphics.update(message.updates)
      break
    }
    default: {
      invariant(false)
    }
  }
})
