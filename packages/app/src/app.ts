import { AppToEngineApi } from '@sim-v2/api'
import { Vec2 } from '@sim-v2/math'
import { Simulator } from '@sim-v2/simulator'

export class App {
  static async init(): Promise<App> {
    const worker = new Worker(
      new URL('./worker.ts', import.meta.url),
    )

    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    const rect = document.body.getBoundingClientRect()

    // TODO figure out size for iOS
    // https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/
    //
    const dpr = Math.min(1, window.devicePixelRatio)

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const viewport = {
      size: new Vec2(rect.width, rect.height),
      scale: dpr,
    }

    const engine = new AppToEngineApi(worker)
    let prev: PointerEvent | null = null

    canvas.addEventListener('pointermove', (e) => {
      if (e.buttons === 1) {
        if (prev) {
          const delta = new Vec2(
            e.clientX - prev.clientX,
            e.clientY - prev.clientY,
          )
          engine.move(delta)
        }
        prev = e
      }
    })

    canvas.addEventListener('pointerup', () => {
      prev = null
    })

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
    })

    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
      },
      { passive: false },
    )

    const simulator = await Simulator.init({
      canvas,
      viewport,
    })

    simulator.start()

    return new App()
  }
}
