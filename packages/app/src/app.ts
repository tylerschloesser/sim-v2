import { getTileSize } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import { Viewport } from '@sim-v2/types'
import { throttle } from '@sim-v2/util'
import { loadCamera, saveCamera } from './camera.js'
import { initCanvasEventListeners } from './init-canvas-event-listeners.js'
import { App, AppConfig, AppSettings } from './types.js'
import { averageInputLatency } from './util.js'

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

  const camera = loadCamera()
  config.reportCamera(camera)

  let tileSize = getTileSize(camera, viewport)

  const simulator = await initSimulator({
    executor: settings.executor.simulator,
    viewport,
    camera,
    callbacks: {
      syncChunks(chunks) {},
    },
  })

  let { world } = simulator

  const graphics = initGraphics({
    executor: settings.executor.graphics,
    strategy: settings.strategy.graphics,
    world,
    canvas,
    viewport,
    camera,
    callbacks: {
      reportFps: config.reportFps,
      reportInputLatency(inputLatency) {
        config.reportInputLatency?.(
          averageInputLatency(inputLatency),
        )
      },
    },
  })

  simulator.addSyncChunksListener(graphics.syncChunks)

  initCanvasEventListeners({
    camera,
    canvas,
    getTileSize: () => tileSize,
    getViewport: () => viewport,
    setCamera(camera, time) {
      // TODO only do this if zoom/viewport changes?
      tileSize = getTileSize(camera, viewport)

      graphics.setCamera(camera, time)
      throttle(simulator.setCamera, 200)(camera)

      throttle(saveCamera, 1000)(camera)

      config.reportCamera(camera)
    },
  })

  return {
    destroy() {
      graphics.stop()
      simulator.stop()
      canvas.remove()
    },
    logWorld: simulator.logWorld,
  }
}
