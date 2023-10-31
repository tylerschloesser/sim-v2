import {
  GraphicsStrategy,
  GraphicsUpdate,
  TransferCamera,
  TransferViewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
  Update = 'update',
}

export interface InitMessage {
  type: MessageType.Init
  strategy: GraphicsStrategy
  canvas: OffscreenCanvas
  viewport: TransferViewport
  camera: TransferCamera
}

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: TransferCamera
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: TransferViewport
}

export interface UpdateMessage {
  type: MessageType.Update
  updates: GraphicsUpdate[]
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
  | UpdateMessage
