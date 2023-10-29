import { Vec2 } from '@sim-v2/math'

export interface Viewport {
  size: Vec2
  scale: number
}

export interface App {}

export interface Simulator {}

export abstract class SimulatorApi {
  abstract init(args: {
    canvas: HTMLCanvasElement
    viewport: Viewport
  }): Promise<SimulatorApi>

  abstract move(args: { delta: Vec2 }): Promise<void>
}
