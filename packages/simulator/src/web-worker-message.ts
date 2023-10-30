import { Vec2 } from '@sim-v2/math'
import { GraphicsStrategy, Viewport } from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  Start = 'start',
  Move = 'move',
  Stop = 'stop',
}

export interface InitMessage {
  type: MessageType.Init
  payload: {
    canvas: OffscreenCanvas
    viewport: Viewport
    graphicsStrategy: GraphicsStrategy
  }
}

export interface StartMessage {
  type: MessageType.Start
}

export interface MoveMessage {
  type: MessageType.Move
  payload: { delta: Vec2 }
}

export interface StopMessage {
  type: MessageType.Stop
}

export type Message =
  | InitMessage
  | StartMessage
  | MoveMessage
  | StopMessage
