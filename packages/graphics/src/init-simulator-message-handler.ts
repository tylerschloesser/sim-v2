import {
  SimulatorMessage,
  SimulatorMessageType,
} from '@sim-v2/types'
import { World } from '@sim-v2/world'
import invariant from 'tiny-invariant'

export function initSimulatorMessageHandler({
  world,
  simulatorPort,
}: {
  world: World
  simulatorPort: MessagePort
}): void {
  simulatorPort.addEventListener('message', (e) => {
    const message = e.data as SimulatorMessage
    switch (message.type) {
      case SimulatorMessageType.SyncChunks: {
        world.chunks = message.chunks
        break
      }
      default: {
        invariant(false)
      }
    }
  })
  simulatorPort.start()
}
