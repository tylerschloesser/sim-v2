import { AppToWorkerApi } from '@sim-v2/api'
import { Vec2 } from '@sim-v2/math'

export class App {
  private readonly canvas: HTMLCanvasElement
  private readonly worker: AppToWorkerApi

  constructor(worker: Worker) {
    this.canvas = document.createElement('canvas')
    document.body.appendChild(this.canvas)

    const rect = document.body.getBoundingClientRect()

    const dpr = window.devicePixelRatio

    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr

    this.worker = new AppToWorkerApi(worker)

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.buttons === 1) {
        const delta = new Vec2(e.movementX, e.movementY)
        this.worker.move(delta)
      }
    })

    // this.canvas.addEventListener(
    //   'wheel',
    //   (e) => {
    //     e.preventDefault()
    //   },
    //   { passive: false },
    // )
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
