import { zoomToTileSize } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import { StatType, Viewport } from '@sim-v2/types'
import { throttle } from '@sim-v2/util'
import invariant from 'tiny-invariant'
import { loadCamera, saveCamera } from './camera.js'
import { initCanvasEventListeners } from './init-canvas-event-listeners.js'
import {
  App,
  AppConfig,
  AppSettings,
  SetCameraFn,
  SetCameraMotionFn,
} from './types.js'

export async function initApp({
  settings,
  config,
}: {
  settings: AppSettings
  config: AppConfig
}): Promise<App> {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)

  const controller = new AbortController()
  const { signal } = controller

  const rect = document.body.getBoundingClientRect()

  canvas.width = rect.width * config.pixelRatio
  canvas.height = rect.height * config.pixelRatio

  const viewport: Viewport = {
    size: new Vec2(rect.width, rect.height),
    pixelRatio: config.pixelRatio,
  }

  const camera = loadCamera()
  config.reportStat({
    type: StatType.Camera,
    value: camera,
  })

  let tileSize = zoomToTileSize(camera.zoom, viewport)

  const simulator = await initSimulator({
    executor: settings.executor.simulator,
    viewport,
    camera,
    callbacks: {
      syncChunk() {},
    },
  })

  let { world } = simulator
  invariant(Object.keys(world.chunks).length === 0)

  const graphics = initGraphics({
    executor: settings.executor.graphics,
    strategy: settings.strategy.graphics,
    // shallow copy so that graphics can maintain its own chunks
    world: { ...world, chunks: {} },
    canvas,
    viewport,
    camera,
    callbacks: {
      reportStat: config.reportStat,
    },
  })

  simulator.addSyncChunkListener(graphics.syncChunk)

  const setCamera: SetCameraFn = (camera, time) => {
    // TODO only do this if zoom/viewport changes?
    tileSize = zoomToTileSize(camera.zoom, viewport)

    graphics.setCamera(camera, time)

    throttle(simulator.setCamera, 200)(camera)
    throttle(saveCamera, 1000)(camera)

    config.reportStat({
      type: StatType.Camera,
      value: camera,
    })
  }

  let cameraMotionInterval: number | undefined

  const setCameraMotion: SetCameraMotionFn = (
    vx,
    vy,
    ax,
    ay,
    duration,
  ) => {
    let x = camera.position.x
    let y = camera.position.y
    const start = performance.now()
    invariant(cameraMotionInterval === undefined)
    cameraMotionInterval = self.setInterval(() => {
      const now = performance.now()

      const dt = Math.min(now - start, duration)

      camera.position.x = x + vx * dt + 0.5 * ax * dt ** 2
      camera.position.y = y + vy * dt + 0.5 * ay * dt ** 2

      // TODO
      setCamera(camera, now)

      if (dt === duration) {
        self.clearInterval(cameraMotionInterval)
        cameraMotionInterval = undefined
      }
    }, 50)
  }

  initCanvasEventListeners({
    camera,
    canvas,
    getTileSize: () => tileSize,
    getViewport: () => viewport,
    setCamera,
    setCameraMotion,
    cancelCameraMotion() {
      self.clearInterval(cameraMotionInterval)
      cameraMotionInterval = undefined
    },
    signal,
  })

  simulator.start()

  signal.addEventListener('abort', () => {
    graphics.stop()
    simulator.stop()
    canvas.remove()
  })

  return {
    destroy() {
      controller.abort()
    },
    logWorld: simulator.logWorld,
  }
}
