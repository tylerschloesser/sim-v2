import {
  Camera,
  InitSimulatorArgs,
  InitSimulatorFn,
  Viewport,
} from '@sim-v2/types'
import { World } from '@sim-v2/world'
import invariant from 'tiny-invariant'
import {
  CallbackMessage,
  CallbackMessageType,
  InitMessage,
  LogWorldMessage,
  MessageType,
  SetCameraMessage,
  SetViewportMessage,
} from './web-worker-message.js'

export const initWebWorkerSimulator: InitSimulatorFn<
  Omit<InitSimulatorArgs, 'executor'>
> = async ({ callbacks, ...args }) => {
  const worker = new Worker(
    new URL('./web-worker-entry.js', import.meta.url),
  )

  const controller = new AbortController()
  const { signal } = controller

  const init: InitMessage = {
    type: MessageType.Init,
    ...args,
  }

  const promise = new Promise<World>((resolve) => {
    worker.addEventListener(
      'message',
      (e) => {
        const message = e.data as CallbackMessage
        invariant(message.type === CallbackMessageType.SetWorld)
        resolve(message.world)
      },
      { once: true, signal },
    )
  })

  let first: boolean = true
  worker.addEventListener(
    'message',
    (e) => {
      if (first) {
        // ignore the first message, it's handled above
        first = false
        return
      }
      const message = e.data as CallbackMessage
      switch (message.type) {
        case CallbackMessageType.SetWorld: {
          callbacks.setWorld(world)
          break
        }
        default: {
          invariant(false)
        }
      }
    },
    { signal },
  )

  signal.addEventListener('abort', () => {
    worker.terminate()
  })

  worker.postMessage(init, [init.graphicsPort])

  let world = await promise

  return {
    world,
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
