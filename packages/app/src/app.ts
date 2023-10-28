import { AppToWorkerApi } from '@sim-v2/api'
import { Vec2 } from '@sim-v2/math'

export class App {
  private readonly canvas: HTMLCanvasElement
  private readonly worker: AppToWorkerApi

  constructor(worker: Worker) {
    this.canvas = document.createElement('canvas')
    document.body.appendChild(this.canvas)

    this.worker = new AppToWorkerApi(worker)
  }

  async connect() {
    await this.worker.connect({
      canvas: this.canvas.transferControlToOffscreen(),
      viewport: new Vec2(0, 0),
    })
  }

  async createWorld() {
    await this.worker.createWorld()
  }
}
