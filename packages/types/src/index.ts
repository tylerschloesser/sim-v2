import { SimpleVec2, Vec2 } from '@sim-v2/math'
import { World } from '@sim-v2/world'

export interface Viewport<V = Vec2> {
  size: V
  pixelRatio: number
}

export interface Camera<V = Vec2> {
  position: V
  zoom: number
}

export enum Executor {
  Local = 'main',
  WebWorker = 'web-worker',
}

export interface InitSimulatorArgs<V = Vec2> {
  executor: Executor
  viewport: Viewport<V>
  camera: Camera<V>
  callbacks: {}
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
  stop(): void
}
