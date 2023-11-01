import { initGraphics } from '@sim-v2/graphics'
import { Vec2, clamp } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import {
  Camera,
  Executor,
  GraphicsStrategy,
  Viewport,
  World,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
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
  pixelRatio: number
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

  canvas.width = rect.width * config.pixelRatio
  canvas.height = rect.height * config.pixelRatio

  const viewport: Viewport = {
    size: new Vec2(rect.width, rect.height),
    pixelRatio: config.pixelRatio,
  }

  const minTileSize =
    Math.min(viewport.size.x, viewport.size.y) * 0.05
  const maxTileSize =
    Math.min(viewport.size.x, viewport.size.y) * 0.5

  const camera: Camera = {
    position: new Vec2(0),
    tileSize: 100,
  }

  const channel = new MessageChannel()

  const world: World = {
    chunkSize: 32,
    chunks: {},
  }

  const graphics = initGraphics({
    executor: settings.executor.graphics,
    strategy: settings.strategy.graphics,
    world,
    canvas,
    viewport,
    camera,
    simulatorPort: channel.port1,
  })

  const simulator = initSimulator({
    executor: settings.executor.simulator,
    world,
    viewport,
    camera,
    graphicsPort: channel.port2,
  })

  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        const delta = new Vec2(
          e.clientX - prev.clientX,
          e.clientY - prev.clientY,
        )
        camera.position.madd(delta)
        graphics.setCamera(camera)
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
      invariant(maxTileSize > minTileSize)
      const range = maxTileSize - minTileSize
      const delta = range * (-e.deltaY / viewport.size.y)
      camera.tileSize = clamp(
        camera.tileSize + delta,
        minTileSize,
        maxTileSize,
      )
      graphics.setCamera(camera)

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
