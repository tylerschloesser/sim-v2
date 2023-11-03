import { getTileSize } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import { Camera, Viewport } from '@sim-v2/types'
import { World } from '@sim-v2/world'
import { initCanvasEventListeners } from './init-canvas-event-listeners.js'
import { initGraphicsMessageHandler } from './init-graphics-message-handler.js'
import { App, AppConfig, AppSettings } from './types.js'

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

  initGraphicsMessageHandler({
    config,
    graphicsPort: ports.app.graphicsPort,
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
