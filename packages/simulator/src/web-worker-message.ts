import { Vec2 } from '@sim-v2/math'
import { InitArgs } from './simulator.js'

export enum MessageType {
  Constructor = 'constructor',
  Start = 'start',
  Move = 'move',
  Stop = 'stop',
}

export interface ConstructorMessage {
  type: MessageType.Constructor
  payload: InitArgs
}

export interface StartMessage {
  type: MessageType.Start
}

export interface MoveMessage {
  type: MessageType.Move
  payload: {
    delta: Vec2
  }
}

export interface StopMessage {
  type: MessageType.Stop
}

export type Message =
  | ConstructorMessage
  | StartMessage
  | MoveMessage
  | StopMessage
