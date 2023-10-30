import { Vec2 } from '@sim-v2/math'
import { GraphicsStrategy, Viewport } from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  Stop = 'stop',
  UpdatePosition = 'update-position',
}

export interface InitMessage {
  type: MessageType.Init
  payload: {
    strategy: GraphicsStrategy
    canvas: OffscreenCanvas
    viewport: Viewport
  }
}

export interface StopMessage {
  type: MessageType.Stop
}

export interface UpdatePositionMessage {
  type: MessageType.UpdatePosition
  payload: { delta: Vec2 }
}

export type Message =
  | InitMessage
  | StopMessage
  | UpdatePositionMessage
