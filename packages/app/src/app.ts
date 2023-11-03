import { getTileSize } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import { Camera, Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
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

  const camera: Camera = {
    position: new Vec2(0),
    zoom: 0.25,
  }

  let tileSize = getTileSize(camera, viewport)

  const ports = getPorts()

  const simulator = await initSimulator({
    executor: settings.executor.simulator,
    viewport,
    camera,
    graphicsPort: ports.simulator.graphicsPort,
    callbacks: {
      setWorld(_world) {
        invariant(false, 'TODO')
      },
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
    simulatorPort: ports.graphics.simulatorPort,
    callbacks: {
      reportFps: config.reportFps,
      reportInputLatency(inputLatency) {
        config.reportInputLatency?.(
          averageInputLatency(inputLatency),
        )
      },
    },
  })

  initCanvasEventListeners({
    camera,
    canvas,
    getTileSize: () => tileSize,
    getViewport: () => viewport,
    setCamera(camera, time) {
      // TODO only do this if zoom/viewport changes?
      tileSize = getTileSize(camera, viewport)

      graphics.setCamera(camera, time)
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

function getPorts() {
  const channel1 = new MessageChannel()

  return {
    graphics: {
      simulatorPort: channel1.port1,
    },
    simulator: {
      graphicsPort: channel1.port2,
    },
  }
}
