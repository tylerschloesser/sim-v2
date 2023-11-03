import { SimpleVec2, Vec2 } from '@sim-v2/math'
import { World } from '@sim-v2/world'

export * from './message.js'

export interface Viewport<T = Vec2> {
  size: T
  pixelRatio: number
}

export type TransferViewport = Viewport<SimpleVec2>

export interface Camera<T = Vec2> {
  position: T
  zoom: number
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
  appPort: MessagePort
}

export type InitSimulatorFn<T = InitSimulatorArgs> = (
  args: T,
) => Simulator

export interface Simulator {
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera): void
  logWorld(): void
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

export interface Graphics {
  setViewport(viewport: Viewport): void
  setCamera(camera: Camera, time: number): void
  stop(): void
}
