import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  InitSimulatorArgs,
  Viewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
  LogWorld = 'log-world',
}

export type InitMessage = {
  type: MessageType.Init
} & Omit<
  InitSimulatorArgs<SimpleVec2>,
  'executor' | 'callbacks'
>

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: Camera<SimpleVec2>
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: Viewport<SimpleVec2>
}

export interface LogWorldMessage {
  type: MessageType.LogWorld
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
  | LogWorldMessage
