import { Chunk, ChunkId } from './world.js'

export enum SimulatorMessageType {
  SyncChunks = 'sync-chunks',
}

export interface SyncChunksSimulatorMessage {
  type: SimulatorMessageType.SyncChunks
  chunks: Record<ChunkId, Chunk>
}

export type SimulatorMessage = SyncChunksSimulatorMessage

export enum GraphicsMessageType {
  Fps = 'fps',
}

export interface FpsGraphicsMessage {
  type: GraphicsMessageType.Fps
  fps: number
}

export type GraphicsMessage = FpsGraphicsMessage

export enum AppMessageType {
  LogWorld = 'log-world',
}

export interface LogWorldAppMessage {
  type: AppMessageType.LogWorld
}

export type AppMessage = LogWorldAppMessage
