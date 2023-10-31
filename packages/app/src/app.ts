import { initCamera } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import {
  Executor,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'
import { z } from 'zod'

export const AppSettings = z.object({
  executor: z.object({
    simulator: z.nativeEnum(Executor),
    graphics: z.nativeEnum(Executor),
  }),
  strategy: z.object({
    graphics: z.nativeEnum(GraphicsStrategy),
  }),
})
export type AppSettings = z.infer<typeof AppSettings>

export interface AppConfig {
  dpr: number
}

export interface App {
  destroy(): void
}

export async function initApp({
  settings,
  config,
}: {
  settings: AppSettings
  config: AppConfig
}): Promise<App> {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)

  const rect = document.body.getBoundingClientRect()

  canvas.width = rect.width * config.dpr
  canvas.height = rect.height * config.dpr

  const viewport: Viewport = {
    size: new Vec2(rect.width, rect.height),
    scale: config.dpr,
  }

  const graphics = initGraphics({
    canvas,
    executor: settings.executor.graphics,
    strategy: settings.strategy.graphics,
    viewport,
    // camera is mutable, don't share between graphics and simulator
    camera: {
      position: new Vec2(0),
      zoom: 0.5,
    },
  })

  const camera = initCamera({
    graphics,
    viewport,
    settings: {
      position: new Vec2(0),
      zoom: 0.5,
    },
  })

  const simulator = initSimulator({
    executor: settings.executor.simulator,
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
        camera.move(delta)
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
