import { SimpleVec2, Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

export enum AppToEngineMessageType {
  Connect = 'connect',
  Move = 'move',
  CreateWorld = 'create-world',
}

export interface ConnectAppToEngineMessage {
  type: AppToEngineMessageType.Connect
  canvas: OffscreenCanvas
  viewport: {
    size: SimpleVec2
    scale: number
  }
}

export interface MoveAppToEngineMessage {
  type: AppToEngineMessageType.Move
  delta: SimpleVec2
}

export interface CreateWorldAppToEngineMessage {
  type: AppToEngineMessageType.CreateWorld
}

export type AppToEngineMessage =
  | ConnectAppToEngineMessage
  | MoveAppToEngineMessage
  | CreateWorldAppToEngineMessage

export enum EngineToAppMessageType {
  ConnectSuccess = 'connect-success',
}

export interface ConnectSuccessEngineToAppMessage {
  type: EngineToAppMessageType.ConnectSuccess
}

export type EngineToAppMessage =
  ConnectSuccessEngineToAppMessage

export class AppToEngineApi {
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

    const message: ConnectAppToEngineMessage = {
      type: AppToEngineMessageType.Connect,
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
          const message = ev.data as EngineToAppMessage
          invariant(
            message.type ===
              EngineToAppMessageType.ConnectSuccess,
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
    const message: MoveAppToEngineMessage = {
      type: AppToEngineMessageType.Move,
      delta,
    }
    this.worker.postMessage(message)
  }

  async createWorld() {
    const message: CreateWorldAppToEngineMessage = {
      type: AppToEngineMessageType.CreateWorld,
    }
    this.worker.postMessage(message)
  }
}
