import { zoomToTileSize } from '@sim-v2/camera'
import { initGraphics } from '@sim-v2/graphics'
import { Vec2 } from '@sim-v2/math'
import { initSimulator } from '@sim-v2/simulator'
import { Settings, StatType, Viewport } from '@sim-v2/types'
import { throttle } from '@sim-v2/util'
import invariant from 'tiny-invariant'
import { loadCamera, saveCamera } from './camera.js'
import { initCanvasEventListeners } from './init-canvas-event-listeners.js'
import {
  App,
  AppConfig,
  SetCameraFn,
  SetCameraMotionFn,
} from './types.js'

export async function initApp({
  settings,
  config,
  container,
}: {
  settings: Settings
  config: AppConfig
  container: HTMLElement
}): Promise<App> {
  const controller = new AbortController()
  const { signal } = controller

  const rect = container.getBoundingClientRect()
  invariant(rect.width > 0)
  invariant(rect.height > 0)

  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

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
    settings: settings.simulator,
    viewport,
    camera,
    callbacks: {
      syncChunk() {},
    },
  })

  let { world } = simulator
  invariant(Object.keys(world.chunks).length === 0)

  const graphics = initGraphics({
    settings: settings.graphics,
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
    tileSize = zoomToTileSize(camera.zoom, viewport)

    graphics.setCamera(camera, time)

    throttle(simulator.setCamera, 200)(camera)
    throttle(saveCamera, 1000)(camera)

    config.reportStat({
      type: StatType.Camera,
      value: camera,
    })
  }

  let cameraMotionActive: boolean = false

  const setCameraMotion: SetCameraMotionFn = (
    vx,
    vy,
    start,
  ) => {
    let x = camera.position.x
    let y = camera.position.y

    const duration = 1000
    const ax = -vx / duration
    const ay = -vy / duration

    invariant(cameraMotionActive === false)
    cameraMotionActive = true

    const smooth = (k: number) => {
      invariant(k >= 0)
      invariant(k <= 1)
      // scale so that the velocity starts slowing
      // roughly linearly and then tapers off
      return (1 - (1 - k) ** 5) / 5
    }

    for (let i = 0; i <= 20; i++) {
      let k = i / 20
      console.log(
        `smooth(${k.toFixed(2)})`,
        smooth(k).toFixed(2),
      )
    }

    function handleCameraMotion(time: number) {
      if (cameraMotionActive === false) {
        console.debug('camera motion canceled')
        return
      }

      let dt = Math.min(time - start, duration)
      dt = smooth(dt / duration) * duration

      camera.position.x = x + vx * dt + 0.5 * ax * dt ** 2
      camera.position.y = y + vy * dt + 0.5 * ay * dt ** 2

      setCamera(camera, null)

      if (time - start >= duration) {
        cameraMotionActive = false
        console.debug('camera motion complete')
      } else {
        requestAnimationFrame(handleCameraMotion)
      }
    }
    handleCameraMotion(performance.now())
  }

  initCanvasEventListeners({
    camera,
    canvas,
    getTileSize: () => tileSize,
    getViewport: () => viewport,
    setCamera,
    setCameraMotion,
    cancelCameraMotion() {
      cameraMotionActive = false
    },
    signal,
    reportStat: config.reportStat,
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
