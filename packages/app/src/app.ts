import { Vec2 } from '@sim-v2/math'
import { Simulator } from '@sim-v2/simulator'
import { getDevicePixelRatio } from './util.js'

export class App {
  static async init(): Promise<App> {
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    const rect = document.body.getBoundingClientRect()

    const dpr = getDevicePixelRatio()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const viewport = {
      size: new Vec2(rect.width, rect.height),
      scale: dpr,
    }

    const simulator = new Simulator({ canvas, viewport })

    let prev: PointerEvent | null = null

    canvas.addEventListener('pointermove', (e) => {
      if (e.buttons === 1) {
        if (prev) {
          const delta = new Vec2(
            e.clientX - prev.clientX,
            e.clientY - prev.clientY,
          )
          simulator.move({ delta })
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

    simulator.start()

    return new App()
  }
}
