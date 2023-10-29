import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'
import { ISimulator, InitArgs } from './index.js'
import {
  ConstructorMessage,
  MessageType,
  MoveMessage,
  StartMessage,
  StopMessage,
} from './web-worker-message.js'

export class WebWorkerBridge implements ISimulator {
  private worker: Worker

  constructor(args: InitArgs) {
    this.worker = new Worker(
      new URL('./web-worker-entry.js', import.meta.url),
    )

    const message: ConstructorMessage = {
      type: MessageType.Constructor,
      payload: args,
    }

    invariant(
      message.payload.canvas instanceof OffscreenCanvas,
    )

    this.worker.postMessage(message, [
      message.payload.canvas,
    ])
  }

  start(): void {
    const message: StartMessage = {
      type: MessageType.Start,
    }
    this.worker.postMessage(message)
  }
  move(args: { delta: Vec2 }): void {
    const message: MoveMessage = {
      type: MessageType.Move,
      payload: args,
    }
    this.worker.postMessage(message)
  }
  stop(): void {
    const message: StopMessage = {
      type: MessageType.Stop,
    }
    this.worker.postMessage(message)
  }
}
