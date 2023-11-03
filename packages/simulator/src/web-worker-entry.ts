import { Vec2 } from '@sim-v2/math'
import { InitSimulatorArgs, Simulator } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initLocalSimulator } from './init-local-simulator.js'
import {
  CallbackMessageType,
  Message,
  MessageType,
  SetWorldCallbackMessage,
} from './web-worker-message.js'

let simulator: Simulator | null = null

self.addEventListener('message', async (e) => {
  const message = e.data as Message

  switch (message.type) {
    case MessageType.Init: {
      invariant(simulator === null)

      const callbacks = initCallbacks()

      simulator = await initLocalSimulator({
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

      callbacks.setWorld(simulator.world)

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

function initCallbacks(): InitSimulatorArgs['callbacks'] {
  return {
    setWorld(world) {
      const message: SetWorldCallbackMessage = {
        type: CallbackMessageType.SetWorld,
        world,
      }
      self.postMessage(message)
    },
  }
}
