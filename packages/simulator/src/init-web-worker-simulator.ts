import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
  Viewport,
} from '@sim-v2/types'
import { Chunk, ChunkId, World } from '@sim-v2/world'
import invariant from 'tiny-invariant'
import {
  InitRequestMessage,
  LogWorldMessage,
  Message,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
  StartMessage,
} from './web-worker-message.js'

export const initWebWorkerSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = async ({ callbacks, ...args }) => {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const syncChunksListeners: ((
    chunks: Record<ChunkId, Chunk>,
  ) => void)[] = []

  const controller = new AbortController()
  const { signal } = controller

  signal.addEventListener('abort', () => {
    worker.terminate()
  })

  const init: InitRequestMessage = {
    type: MessageType.InitRequest,
    ...args,
  }

  const promise = new Promise<World>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject('timeout')
    }, 1000)
    worker.addEventListener(
      'message',
      (e) => {
        clearTimeout(timeout)
        const message = e.data as Message
        invariant(message.type === MessageType.InitResponse)
        resolve(message.world)
      },
      { once: true, signal },
    )
  })

  worker.postMessage(init)

  const world = await promise

  worker.addEventListener('message', (e) => {
    const message = e.data as Message
    switch (message.type) {
      case MessageType.SyncChunksCallback: {
        for (const syncChunks of syncChunksListeners) {
          syncChunks(message.chunks)
        }
        callbacks.syncChunks(message.chunks)
        break
      }
      default: {
        invariant(false)
      }
    }
  })

  return {
    world,
    start(): void {
      const message: StartMessage = {
        type: MessageType.Start,
      }
      worker.postMessage(message)
    },
    stop(): void {
      controller.abort()
    },
    setCamera(camera: Camera): void {
      const message: SetCameraMessage = {
        type: MessageType.SetCamera,
        camera,
      }
      worker.postMessage(message)
    },
    setViewport(viewport: Viewport): void {
      const message: SetViewportMessage = {
        type: MessageType.SetViewport,
        viewport,
      }
      worker.postMessage(message)
    },
    logWorld(): void {
      const message: LogWorldMessage = {
        type: MessageType.LogWorld,
      }
      worker.postMessage(message)
    },
    addSyncChunksListener(listener) {
      syncChunksListeners.push(listener)
    },
  }
}
