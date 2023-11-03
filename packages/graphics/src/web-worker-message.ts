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
  ReportFpsCallback = 'report-fps-callback',
  ReportInputLatencyCallback = 'report-input-latency-callback',
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

export interface ReportFpsCallbackMessage {
  type: MessageType.ReportFpsCallback
  fps: number
}

export interface ReportInputLatencyCallbackMessage {
  type: MessageType.ReportInputLatencyCallback
  inputLatency: number
}

export type Message =
  | InitMessage
  | SetCameraMessage
  | SetViewportMessage
  | SyncChunksMessage
  | ReportFpsCallbackMessage
  | ReportInputLatencyCallbackMessage
