import {
  GraphicsStrategy,
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
  strategy: GraphicsStrategy
  world: World
  canvas: OffscreenCanvas
  viewport: TransferViewport
  camera: TransferCamera
  simulatorPort: MessagePort
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
