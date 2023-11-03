import { SimpleVec2, Vec2 } from '@sim-v2/math'
import { Chunk, ChunkId, World } from '@sim-v2/world'
import * as z from 'zod'

export interface Viewport<V = Vec2> {
  size: V
  pixelRatio: number
}

export interface Camera<V = Vec2> {
  position: V
  zoom: number
}

export const SimpleCamera = z.object({
  position: SimpleVec2,
  zoom: z.number(),
})

export type SimpleCamera = z.infer<typeof SimpleCamera>

export enum Executor {
  Local = 'main',
  WebWorker = 'web-worker',
}

export interface InitSimulatorArgs<V = Vec2> {
  executor: Executor
  viewport: Viewport<V>
  camera: Camera<V>
  callbacks: {
    syncChunks(chunks: Record<ChunkId, Chunk>): void
  }
}

export type InitSimulatorFn<T = InitSimulatorArgs> = (
  args: T,
) => Promise<Simulator>

export interface Simulator {
  world: World
  start(): void
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera): void
  logWorld(): void
  stop(): void
  addSyncChunksListener(
    listener: (chunks: Record<ChunkId, Chunk>) => void,
  ): void
}
export enum GraphicsStrategy {
  Cpu = 'cpu',
  Gpu = 'gpu',
}

export type ReportFpsFn = (fps: number) => void
export type ReportInputLatencyFn = (
  inputLatency: number,
) => void

export interface InitGraphicsArgs<
  C = HTMLCanvasElement | OffscreenCanvas,
  V = Vec2,
> {
  executor: Executor
  strategy: GraphicsStrategy
  world: World
  canvas: C
  viewport: Viewport<V>
  camera: Camera<V>
  callbacks: {
    reportFps: ReportFpsFn
    reportInputLatency: ReportInputLatencyFn
  }
}

export type InitGraphicsFn<T = InitGraphicsArgs> = (
  args: T,
) => Graphics

export interface Graphics {
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera, time: number): void
  syncChunks(chunks: Record<ChunkId, Chunk>): void
  stop(): void
}
