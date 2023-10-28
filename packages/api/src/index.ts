import { SimpleVec2, Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

export enum AppToWorkerMessageType {
  Connect = 'connect',
  Move = 'move',
  CreateWorld = 'create-world',
}

export interface ConnectAppToWorkerMessage {
  type: AppToWorkerMessageType.Connect
  canvas: OffscreenCanvas
  viewport: {
    size: SimpleVec2
    scale: number
  }
}

export interface MoveAppToWorkerMessage {
  type: AppToWorkerMessageType.Move
  delta: SimpleVec2
}

export interface CreateWorldAppToWorkerMessage {
  type: AppToWorkerMessageType.CreateWorld
}

export type AppToWorkerMessage =
  | ConnectAppToWorkerMessage
  | MoveAppToWorkerMessage
  | CreateWorldAppToWorkerMessage

export enum WorkerToAppMessageType {
  ConnectSuccess = 'connect-success',
}

export interface ConnectSuccessWorkerToAppMessage {
  type: WorkerToAppMessageType.ConnectSuccess
}

export type WorkerToAppMessage =
  ConnectSuccessWorkerToAppMessage

export class AppToWorkerApi {
  private readonly worker: Worker

  private connected: boolean = false

  constructor(worker: Worker) {
    this.worker = worker
  }

  async connect({
    viewport,
    canvas,
  }: {
    viewport: {
      size: Vec2
      scale: number
    }
    canvas: OffscreenCanvas
  }) {
    invariant(this.connected === false)

    const message: ConnectAppToWorkerMessage = {
      type: AppToWorkerMessageType.Connect,
      canvas,
      viewport,
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject('timeout')
      }, 1000)

      this.worker.addEventListener(
        'message',
        (ev) => {
          const message = ev.data as WorkerToAppMessage
          invariant(
            message.type ===
              WorkerToAppMessageType.ConnectSuccess,
          )
          window.clearTimeout(timeout)
          resolve()
        },
        { once: true },
      )

      this.worker.postMessage(message, [canvas])
    })

    this.connected = true
  }

  async move(delta: Vec2) {
    const message: MoveAppToWorkerMessage = {
      type: AppToWorkerMessageType.Move,
      delta,
    }
    this.worker.postMessage(message)
  }

  async createWorld() {
    const message: CreateWorldAppToWorkerMessage = {
      type: AppToWorkerMessageType.CreateWorld,
    }
    this.worker.postMessage(message)
  }
}
