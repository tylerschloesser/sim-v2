import {
  GraphicsStrategy,
  TransferCamera,
  TransferViewport,
} from '@sim-v2/types'
import { World } from '@sim-v2/world'

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
  appPort: MessagePort
}

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: TransferCamera
  time: number
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: TransferViewport
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage

export enum CallbackMessageType {
  ReportFps = 'report-fps',
  ReportInputLatency = 'report-input-latency',
}

export interface ReportFpsCallbackMessage {
  type: CallbackMessageType.ReportFps
  fps: number
}

export interface ReportInputLatencyCallbackMessage {
  type: CallbackMessageType.ReportInputLatency
  inputLatency: number
}

export type CallbackMessage =
  | ReportFpsCallbackMessage
  | ReportInputLatencyCallbackMessage
