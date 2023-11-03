import { Vec2 } from '@sim-v2/math'
import { Simulator } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initLocalSimulator } from './init-local-simulator.js'
import {
  Message,
  MessageType,
} from './web-worker-message.js'

let simulator: Simulator | null = null

self.addEventListener('message', (e) => {
  const message = e.data as Message
  switch (message.type) {
    case MessageType.Init: {
      invariant(simulator === null)
      simulator = initLocalSimulator({
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
    case MessageType.LogWorld: {
      invariant(simulator)
      simulator.logWorld()
      break
    }
    default: {
      invariant(false)
    }
  }
})
