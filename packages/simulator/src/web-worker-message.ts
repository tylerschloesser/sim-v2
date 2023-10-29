import { Vec2 } from '@sim-v2/math'
import { InitArgs } from './index.js'

export enum MessageType {
  Constructor = 'constructor',
  Start = 'start',
  Move = 'move',
}

export interface ConstructorMessage {
  type: MessageType.Constructor
  payload: InitArgs
}

export interface StartMessage {
  type: MessageType.Start
  payload: undefined
}

export interface MoveMessage {
  type: MessageType.Move
  payload: {
    delta: Vec2
  }
}

export type Message =
  | ConstructorMessage
  | StartMessage
  | MoveMessage
