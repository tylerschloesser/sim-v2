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

export type SyncChunksFn = (args: {
  chunks: Set<Chunk>
  show: Set<ChunkId>
  hide: Set<ChunkId>
}) => void

export interface InitSimulatorArgs<V = Vec2> {
  executor: Executor
  viewport: Viewport<V>
  camera: Camera<V>
  callbacks: {
    syncChunks: SyncChunksFn
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
  addSyncChunksListener(listener: SyncChunksFn): void
}
export enum GraphicsStrategy {
  Cpu = 'cpu',
  Gpu = 'gpu',
}

export enum StatType {
  RenderedChunks = 'rendered-chunks',
  Fps = 'fps',
  InputLatency = 'input-latency',
  Camera = 'camera',
}

type StatUtil<T extends StatType, V> = {
  type: T
  value: V
}

export type Stat =
  | StatUtil<StatType.RenderedChunks, number>
  | StatUtil<StatType.Fps, number>
  | StatUtil<StatType.InputLatency, number>
  | StatUtil<StatType.Camera, SimpleCamera>

export type ReportStatFn = (stat: Stat) => void

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
    reportStat: ReportStatFn
  }
}

export type InitGraphicsFn<T = InitGraphicsArgs> = (
  args: T,
) => Graphics

export interface Graphics {
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera, time: number): void
  syncChunks: SyncChunksFn
  stop(): void
}

export type RenderFn = (time: number) => void
