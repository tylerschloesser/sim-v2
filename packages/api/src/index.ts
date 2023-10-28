import { Vec2 } from '@sim-v2/math'

export interface AppToWorkerApi {
  connect(args: { viewport: Vec2 }): void
  createWorld(): void
}
