import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
}

export interface InitMessage {
  type: MessageType.Init
  strategy: GraphicsStrategy
  canvas: OffscreenCanvas
  viewport: Viewport
  camera: Omit<Camera, 'position'> & {
    position: SimpleVec2
  }
}

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: Camera
}

export type Message = InitMessage | SetCameraMessage
