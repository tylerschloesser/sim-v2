import { Vec2 } from '@sim-v2/math'

export interface Viewport {
  size: Vec2
  scale: number
}

export enum SimulatorStrategy {
  Local = 'local',
  WebWorker = 'web-worker',
}

export interface InitSimulatorArgs {
  strategy: SimulatorStrategy
  graphicsStrategy: GraphicsStrategy
  canvas: HTMLCanvasElement
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

export interface Graphics {
  stop(): void
  updatePosition(delta: Vec2): void
}
