import { SimpleVec2 } from '@sim-v2/math'
import { Camera, Viewport } from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  Move = 'move',
}

export interface InitMessage {
  type: MessageType.Init
  payload: {
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

export type Message = InitMessage | MoveMessage
