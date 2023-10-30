import { SimpleVec2, Vec2 } from '@sim-v2/math'

export interface Viewport {
  size: Vec2
  scale: number
}

export enum Executor {
  Main = 'main',
  WebWorker = 'web-worker',
}

export interface InitSimulatorArgs {
  executor: Executor
  viewport: Viewport
  camera: Camera
}

export type InitSimulatorFn = (
  args: InitSimulatorArgs,
) => Simulator

export interface Simulator {
  move(delta: SimpleVec2): void
  stop(): void
}

export enum GraphicsStrategy {
  Cpu = 'cpu',
  Gpu = 'gpu',
}

export interface Camera {
  position: Vec2
  zoom: number
}

export interface InitGraphicsArgs {
  executor: Executor
  strategy: GraphicsStrategy
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
  camera: Camera
}

export type InitGraphicsFn<T = InitGraphicsArgs> = (
  args: T,
) => Graphics

export interface Graphics {
  move(delta: SimpleVec2): void
  stop(): void
}
