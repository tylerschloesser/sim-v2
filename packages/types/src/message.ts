import { Chunk, ChunkId } from '@sim-v2/world'

export enum SimulatorMessageType {
  SyncChunks = 'sync-chunks',
}

export interface SyncChunksSimulatorMessage {
  type: SimulatorMessageType.SyncChunks
  chunks: Record<ChunkId, Chunk>
}

export type SimulatorMessage = SyncChunksSimulatorMessage

export enum GraphicsMessageType {
  InputLatency = 'input-latency',
}

export interface InputLatencyGraphicsMessage {
  type: GraphicsMessageType.InputLatency
  inputLatency: number
}

export type GraphicsMessage = InputLatencyGraphicsMessage
