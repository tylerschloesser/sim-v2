import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  InitGraphicsArgs,
  Stat,
  Viewport,
} from '@sim-v2/types'
import { Chunk } from '@sim-v2/world'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetCameraMotion = 'set-camera-motion',
  SetViewport = 'set-viewport',
  SyncChunk = 'sync-chunk',
  ReportStatCallback = 'report-stat-callback',
}

export type InitMessage = {
  type: MessageType.Init
} & Omit<
  InitGraphicsArgs<OffscreenCanvas, SimpleVec2>,
  'callbacks'
>

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: Camera<SimpleVec2>
  time: number
}

export interface SetCameraMotionMessage {
  type: MessageType.SetCameraMotion
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: Viewport<SimpleVec2>
}

export interface SyncChunkMessage {
  type: MessageType.SyncChunk
  chunk: Chunk
  index: number
}

export interface ReportStatCallbackMessage {
  type: MessageType.ReportStatCallback
  stat: Stat
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetCameraMotionMessage
  | SetViewportMessage
  | SyncChunkMessage
  | ReportStatCallbackMessage
