import { getVisibleChunkIds } from '@sim-v2/camera'
import {
  AppMessage,
  AppMessageType,
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
  SimulatorMessageType,
  SyncChunksSimulatorMessage,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { generateChunk } from './generate-chunk.js'

export enum SimulatorState {
  Stopped = 'stopped',
  Started = 'started',
}

export const initLocalSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = ({ graphicsPort, appPort, world, ...args }) => {
  let state: SimulatorState = SimulatorState.Started
  let { camera, viewport } = args

  appPort.addEventListener('message', (e) => {
    const message = e.data as AppMessage
    switch (message.type) {
      case AppMessageType.LogWorld: {
        console.log(world)
        break
      }
      default: {
        invariant(false)
      }
    }
  })
  appPort.start()

  let visibleChunkIds = getVisibleChunkIds({
    camera,
    viewport,
  })

  for (const chunkId of visibleChunkIds) {
    if (!world.chunks[chunkId]) {
      world.chunks[chunkId] = generateChunk({
        chunkId,
        chunkSize: world.chunkSize,
      })
    }
  }

  const message: SyncChunksSimulatorMessage = {
    type: SimulatorMessageType.SyncChunks,
    chunks: world.chunks,
  }
  graphicsPort.postMessage(message)

  return {
    stop(): void {
      invariant(state === SimulatorState.Started)
      state = SimulatorState.Stopped
    },
    setCamera(next: Camera): void {
      camera = next
    },
    setViewport() {
      invariant(false, 'TODO')
    },
  }
}
