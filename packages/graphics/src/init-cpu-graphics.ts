import { getTileSize } from '@sim-v2/camera'
import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  Viewport,
} from '@sim-v2/types'
import {
  TILE_TYPE_TO_COLOR,
  iterateTiles,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { initSimulatorMessageHandler } from './init-simulator-message-handler.js'
import { measureFps } from './measure-fps.js'
import { getCpuContext } from './util.js'

export const initCpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({
  canvas,
  simulatorPort,
  world,
  callbacks,
  ...args
}) => {
  let { viewport, camera } = args
  let tileSize = getTileSize(camera, viewport)

  const controller = new AbortController()

  initSimulatorMessageHandler({
    world,
    simulatorPort,
  })

  const context = getCpuContext(canvas)
  context.scale(viewport.pixelRatio, viewport.pixelRatio)

  const render = measureFps(
    callbacks?.reportFps,
    (_time: number) => {
      if (controller.signal.aborted) {
        return
      }

      context.save()

      context.clearRect(
        0,
        0,
        viewport.size.x,
        viewport.size.y,
      )

      context.translate(
        viewport.size.x / 2,
        viewport.size.y / 2,
      )

      context.translate(
        camera.position.x * tileSize,
        camera.position.y * tileSize,
      )

      for (const chunk of Object.values(world.chunks)) {
        for (let { position, tile } of iterateTiles(
          chunk,
          world,
        )) {
          context.fillStyle = TILE_TYPE_TO_COLOR[tile.type]
          context.fillRect(
            position.x * tileSize,
            position.y * tileSize,
            tileSize,
            tileSize,
          )
        }
      }

      context.restore()

      requestAnimationFrame(render)
    },
  )

  requestAnimationFrame(render)

  return {
    stop() {
      controller.abort()
    },
    setCamera(next: Camera, time: number): void {
      const now = performance.timeOrigin + performance.now()
      callbacks?.reportInputLatency?.(now - time)
      camera = next
      tileSize = getTileSize(camera, viewport)
    },
    setViewport(_next: Viewport): void {
      invariant(false, 'TODO')
    },
  }
}
