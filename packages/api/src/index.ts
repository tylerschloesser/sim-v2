import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

export enum AppToWorkerMessageType {
  Connect = 'connect',
  CreateWorld = 'create-world',
}

export interface ConnectAppToWorkerMessage {
  type: AppToWorkerMessageType.Connect
  canvas: OffscreenCanvas
}

export interface CreateWorldAppToWorkerMessage {
  type: AppToWorkerMessageType.CreateWorld
}

export type AppToWorkerMessage =
  | ConnectAppToWorkerMessage
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
    canvas,
  }: {
    viewport: Vec2
    canvas: OffscreenCanvas
  }) {
    invariant(this.connected === false)

    const message: ConnectAppToWorkerMessage = {
      type: AppToWorkerMessageType.Connect,
      canvas,
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

  async createWorld() {
    const message: CreateWorldAppToWorkerMessage = {
      type: AppToWorkerMessageType.CreateWorld,
    }
    this.worker.postMessage(message)
  }
}
