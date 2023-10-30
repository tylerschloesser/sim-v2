import { Vec2 } from '@sim-v2/math'

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
}

export type InitSimulatorFn = (
  args: InitSimulatorArgs,
) => Simulator

export interface Simulator {
  start(): void
  move(delta: Vec2): void
  stop(): void
}

export enum GraphicsStrategy {
  Cpu = 'cpu',
  Gpu = 'gpu',
}

export interface InitGraphicsArgs {
  executor: Executor
  strategy: GraphicsStrategy
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}

export type InitGraphicsFn = (
  args: InitGraphicsArgs,
) => Graphics

export interface Graphics {
  stop(): void
  updatePosition(delta: Vec2): void
}
