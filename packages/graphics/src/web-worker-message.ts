import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  Move = 'move',
  Zoom = 'zoom',
}

export interface InitMessage {
  type: MessageType.Init
  payload: {
    strategy: GraphicsStrategy
    canvas: OffscreenCanvas
    viewport: Viewport
    camera: Omit<Camera, 'position'> & {
      position: SimpleVec2
    }
  }
}

export interface MoveMessage {
  type: MessageType.Move
  payload: { delta: SimpleVec2 }
}

export interface ZoomMessage {
  type: MessageType.Zoom
  payload: { delta: number }
}

export type Message =
  | InitMessage
  | MoveMessage
  | ZoomMessage
