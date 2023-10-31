import {
  TransferCamera,
  TransferViewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
}

export interface InitMessage {
  type: MessageType.Init
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

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
