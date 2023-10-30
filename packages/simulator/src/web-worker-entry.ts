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
    case MessageType.Init:
      invariant(simulator === null)
      simulator = initLocalSimulator(message.payload)
      break
    case MessageType.Move:
      invariant(simulator !== null)
      simulator.move(message.payload.delta)
      break
  }
})
