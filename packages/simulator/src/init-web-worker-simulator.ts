import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
  Viewport,
} from '@sim-v2/types'
import { World } from '@sim-v2/world'
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

  const controller = new AbortController()
  const { signal } = controller

  const init: InitRequestMessage = {
    type: MessageType.InitRequest,
    ...args,
  }

  const world = new Promise<World>((resolve, reject) => {
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

  signal.addEventListener('abort', () => {
    worker.terminate()
  })

  return {
    world: await world,
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
  }
}
