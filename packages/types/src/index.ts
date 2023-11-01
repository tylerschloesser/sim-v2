import { SimpleVec2, Vec2 } from '@sim-v2/math'
import { Chunk, ChunkId, World } from './world.js'

export * from './world.js'

export interface Viewport<T = Vec2> {
  size: T
  pixelRatio: number
}

export type TransferViewport = Viewport<SimpleVec2>

export interface Camera<T = Vec2> {
  position: T
  tileSize: number
}

export type TransferCamera = Camera<SimpleVec2>

export enum Executor {
  Local = 'main',
  WebWorker = 'web-worker',
}

export interface InitSimulatorArgs {
  executor: Executor
  viewport: Viewport
  world: World
  camera: Camera
  graphicsPort: MessagePort
}

export type InitSimulatorFn<T = InitSimulatorArgs> = (
  args: T,
) => Simulator

export interface Simulator {
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera): void
  stop(): void
}

export enum GraphicsStrategy {
  Cpu = 'cpu',
  Gpu = 'gpu',
}

export interface InitGraphicsArgs {
  executor: Executor
  strategy: GraphicsStrategy
  world: World
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
  camera: Camera
  simulatorPort: MessagePort
  appPort: MessagePort
}

export type InitGraphicsFn<T = InitGraphicsArgs> = (
  args: T,
) => Graphics

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

export interface Graphics {
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera): void
  stop(): void
}
