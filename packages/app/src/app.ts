import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import {
  AppMessage,
  AppMessageType,
  Camera,
  Executor,
  GraphicsMessage,
  GraphicsMessageType,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import { World } from '@sim-v2/world'
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

export type FpsCallbackFn = (fps: number) => void
export type InputLatencyCallback = (
  inputLatency: number,
) => void

export interface AppConfig {
  pixelRatio: number
  fpsCallback?: FpsCallbackFn
  inputLatencyCallback?: InputLatencyCallback
}

export interface App {
  destroy(): void
  logWorld(): void
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
    tileSize: minTileSize + (maxTileSize - minTileSize) / 4,
  }

  console.debug({
    minTileSize,
    maxTileSize,
    initialTileSize: camera.tileSize,
  })

  const world: World = {
    tickDuration: 100,
    chunkSize: 32,
    tick: 0,
    chunks: {},
  }

  const ports = getPorts()

  const graphics = initGraphics({
    executor: settings.executor.graphics,
    strategy: settings.strategy.graphics,
    world,
    canvas,
    viewport,
    camera,
    simulatorPort: ports.graphics.simulatorPort,
    appPort: ports.graphics.appPort,
  })

  const simulator = initSimulator({
    executor: settings.executor.simulator,
    world,
    viewport,
    camera,
    graphicsPort: ports.simulator.graphicsPort,
    appPort: ports.simulator.appPort,
  })

  // report the input latency as the average of the last N values
  //
  const averageInputLatency = (() => {
    const count = 20
    let i = 0
    const prev = new Array<number | null>(count).fill(null)
    return (inputLatency: number) => {
      prev[i] = inputLatency
      i = (i + 1) % count
      const average =
        prev
          .filter((v): v is number => v !== null)
          .reduce((acc, v) => acc + v, 0) / prev.length
      return average
    }
  })()

  ports.app.graphicsPort.addEventListener(
    'message',
    (e) => {
      const message = e.data as GraphicsMessage
      switch (message.type) {
        case GraphicsMessageType.Fps: {
          config.fpsCallback?.(message.fps)
          break
        }
        case GraphicsMessageType.InputLatency: {
          config.inputLatencyCallback?.(
            averageInputLatency(message.inputLatency),
          )
          break
        }
        default: {
          invariant(false)
        }
      }
    },
  )
  ports.app.graphicsPort.start()

  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        camera.position.x +=
          (e.clientX - prev.clientX) / camera.tileSize
        camera.position.y +=
          (e.clientY - prev.clientY) / camera.tileSize

        graphics.setCamera(
          camera,
          performance.timeOrigin + e.timeStamp,
        )
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
      graphics.setCamera(
        camera,
        performance.timeOrigin + e.timeStamp,
      )

      e.preventDefault()
    },
    { passive: false },
  )

  function logWorld() {
    const message: AppMessage = {
      type: AppMessageType.LogWorld,
    }
    ports.app.simulatorPort.postMessage(message)
  }

  return {
    destroy() {
      graphics.stop()
      simulator.stop()
      canvas.remove()
    },
    logWorld,
  }
}

function getPorts() {
  const channel1 = new MessageChannel()
  const channel2 = new MessageChannel()
  const channel3 = new MessageChannel()

  return {
    graphics: {
      simulatorPort: channel2.port1,
      appPort: channel1.port2,
    },
    simulator: {
      graphicsPort: channel2.port2,
      appPort: channel3.port2,
    },
    app: {
      graphicsPort: channel1.port1,
      simulatorPort: channel3.port1,
    },
  }
}
