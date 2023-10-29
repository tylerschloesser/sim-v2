import { Vec2 } from '@sim-v2/math'
import { SimulatorApi, Viewport } from '@sim-v2/types'

export class LocalSimulatorApi extends SimulatorApi {
  constructor() {
    super()
  }

  static async init(args: {
    canvas: HTMLCanvasElement
    viewport: Viewport
  }): Promise<SimulatorApi> {
    return new LocalSimulatorApi()
  }
  move(args: { delta: Vec2 }): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
