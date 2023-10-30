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
      graphics = initLocalGraphics(message.payload)
      break
    }
    case MessageType.Stop: {
      invariant(graphics !== null)
      graphics.stop()
      break
    }
    case MessageType.UpdatePosition: {
      invariant(graphics !== null)
      graphics.updatePosition(message.payload.delta)
      break
    }
  }
})
