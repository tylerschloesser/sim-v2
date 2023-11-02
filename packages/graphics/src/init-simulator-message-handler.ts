import {
  SimulatorMessage,
  SimulatorMessageType,
} from '@sim-v2/types'
import { Chunk, World } from '@sim-v2/world'
import invariant from 'tiny-invariant'

export type SyncChunkCallbackFn = (chunk: Chunk) => void

export function initSimulatorMessageHandler({
  world,
  simulatorPort,
  syncChunkCallback,
}: {
  world: World
  simulatorPort: MessagePort
  syncChunkCallback?: SyncChunkCallbackFn
}): void {
  simulatorPort.addEventListener('message', (e) => {
    const message = e.data as SimulatorMessage
    switch (message.type) {
      case SimulatorMessageType.SyncChunks: {
        if (syncChunkCallback) {
          for (const chunk of Object.values(
            message.chunks,
          )) {
            syncChunkCallback(chunk)
          }
        }
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
