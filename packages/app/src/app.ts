import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import { SimulatorStrategy } from '@sim-v2/types'
import { getDevicePixelRatio } from './util.js'

export interface App {
  destroy(): void
}

export async function initApp(
  strategy: SimulatorStrategy,
): Promise<App> {
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

  let simulator = initSimulator({
    strategy,
    canvas,
    viewport,
  })

  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        const delta = new Vec2(
          e.clientX - prev.clientX,
          e.clientY - prev.clientY,
        )
        simulator.move(delta)
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

  return {
    destroy() {
      simulator.stop()
      canvas.remove()
    },
  }
}
