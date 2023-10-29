import invariant from 'tiny-invariant'
import { Simulator } from './index.js'
import {
  Message,
  MessageType,
} from './web-worker-message.js'

let simulator: Simulator | null = null

self.addEventListener('message', (e) => {
  const message = e.data as Message
  switch (message.type) {
    case MessageType.Constructor:
      invariant(simulator === null)
      simulator = new Simulator(message.payload)
      break
    case MessageType.Start:
      invariant(simulator !== null)
      simulator.start()
      break
    case MessageType.Move:
      invariant(simulator !== null)
      simulator.move(message.payload)
      break
  }
})
