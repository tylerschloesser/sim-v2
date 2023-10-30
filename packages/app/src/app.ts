import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import {
  Camera,
  Executor,
  GraphicsStrategy,
} from '@sim-v2/types'
import { getDevicePixelRatio } from './util.js'

export interface AppConfig {
  executor: {
    simulator: Executor
    graphics: Executor
  }
  strategy: {
    graphics: GraphicsStrategy
  }
}

export interface App {
  destroy(): void
}

export async function initApp(
  config: AppConfig,
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

  let graphics = initGraphics({
    canvas,
    executor: config.executor.graphics,
    strategy: config.strategy.graphics,
    viewport,
    // camera is mutable, don't share between graphics and simulator
    camera: {
      position: new Vec2(0),
      zoom: 0.5,
    },
  })

  let simulator = initSimulator({
    executor: config.executor.simulator,
    viewport,
    // camera is mutable, don't share between graphics and simulator
    camera: {
      position: new Vec2(0),
      zoom: 0.5,
    },
  })

  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        const delta = new Vec2(
          e.clientX - prev.clientX,
          e.clientY - prev.clientY,
        )
        graphics.move(delta)
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

  return {
    destroy() {
      graphics.stop()
      simulator.stop()
      canvas.remove()
    },
  }
}
