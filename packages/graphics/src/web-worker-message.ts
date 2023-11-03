import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
}

export type InitMessage = {
  type: MessageType.Init
} & Omit<
  InitGraphicsArgs<OffscreenCanvas, SimpleVec2>,
  'executor' | 'callbacks'
>

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: Camera<SimpleVec2>
  time: number
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: Viewport<SimpleVec2>
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
