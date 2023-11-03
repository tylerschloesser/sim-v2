import { getTileSize } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import {
  AppMessage,
  AppMessageType,
  Camera,
  Executor,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'
import { clamp } from '@sim-v2/util'
import { World } from '@sim-v2/world'
import { z } from 'zod'
import { initGraphicsMessageHandler } from './init-graphics-message-handler.js'

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

  const camera: Camera = {
    position: new Vec2(0),
    zoom: 0.25,
  }

  let tileSize = getTileSize(camera, viewport)

  const world: World = {
    seed: `${0}`,
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

  function setCamera(camera: Camera<Vec2>, time: number) {
    // TODO only do this if zoom/viewport changes?
    tileSize = getTileSize(camera, viewport)

    graphics.setCamera(camera, time)
  }

  initGraphicsMessageHandler({
    config,
    graphicsPort: ports.app.graphicsPort,
  })

  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        camera.position.x +=
          (e.clientX - prev.clientX) / tileSize
        camera.position.y +=
          (e.clientY - prev.clientY) / tileSize

        setCamera(
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
      camera.zoom = clamp(
        camera.zoom + -e.deltaY / viewport.size.y,
        0,
        1,
      )
      setCamera(
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
