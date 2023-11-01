import {
  TransferCamera,
  TransferViewport,
  World,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
}

export interface InitMessage {
  type: MessageType.Init
  world: World
  viewport: TransferViewport
  camera: TransferCamera
  graphicsPort: MessagePort
  appPort: MessagePort
}

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: TransferCamera
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: TransferViewport
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
