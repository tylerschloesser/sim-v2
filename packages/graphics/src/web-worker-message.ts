import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  InitGraphicsArgs,
  Viewport,
} from '@sim-v2/types'
import { Chunk, ChunkId } from '@sim-v2/world'

export enum MessageType {
  Init = 'init',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
  SyncChunks = 'sync-chunks',
  ReportStatCallback = 'report-stat-callback',
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

export interface SyncChunksMessage {
  type: MessageType.SyncChunks
  chunks: Record<ChunkId, Chunk>
}

export type ReportStatCallbackMessage = {
  type: MessageType.ReportStatCallback
} & (
  | {
      key: 'rendered-chunks'
      value: number
    }
  | {
      key: 'fps'
      value: number
    }
  | {
      key: 'input-latency'
      value: number
    }
)

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
  | SyncChunksMessage
  | ReportStatCallbackMessage
