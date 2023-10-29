import { Vec2 } from '@sim-v2/math'

export interface Viewport {
  size: Vec2
  scale: number
}

export enum SimulatorStrategy {
  Local = 'local',
  WebWorker = 'web-worker',
}
