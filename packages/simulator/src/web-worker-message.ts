import {
  TransferCamera,
  TransferViewport,
} from '@sim-v2/types'
import { World } from '@sim-v2/world'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
  LogWorld = 'log-world',
}

export interface InitMessage {
  type: MessageType.Init
  world: World
  viewport: TransferViewport
  camera: TransferCamera
  graphicsPort: MessagePort
}

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: TransferCamera
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: TransferViewport
}

export interface LogWorldMessage {
  type: MessageType.LogWorld
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
  | LogWorldMessage
