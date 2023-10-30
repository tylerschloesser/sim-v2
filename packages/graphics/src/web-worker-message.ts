import { Vec2 } from '@sim-v2/math'
import {
  Camera,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  Move = 'move',
}

export interface InitMessage {
  type: MessageType.Init
  payload: {
    strategy: GraphicsStrategy
    canvas: OffscreenCanvas
    viewport: Viewport
    camera: Camera
  }
}

export interface MoveMessage {
  type: MessageType.Move
  payload: { delta: Vec2 }
}

export type Message = InitMessage | MoveMessage
