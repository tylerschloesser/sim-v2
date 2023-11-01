import { getVisibleChunkIds } from '@sim-v2/camera'
import {
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
> = ({ graphicsPort, world, ...args }) => {
  let state: SimulatorState = SimulatorState.Started
  let { camera, viewport } = args

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
