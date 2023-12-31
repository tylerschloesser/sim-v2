import { zoomToTileSize } from '@sim-v2/camera'
import {
  InitGraphicsArgs,
  InitGraphicsFn,
  StatType,
  Viewport,
} from '@sim-v2/types'
import {
  Chunk,
  TILE_TYPE_TO_COLOR,
  iterateTiles,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { measureFps } from './measure-fps.js'
import { getCpuContext } from './util.js'

export const initCpuGraphics: InitGraphicsFn<
  InitGraphicsArgs
> = ({ canvas, world, callbacks, ...args }) => {
  let { viewport, camera } = args
  let tileSize = zoomToTileSize(camera.zoom, viewport)

  const controller = new AbortController()

  const context = getCpuContext(canvas)
  context.scale(viewport.pixelRatio, viewport.pixelRatio)

  const render = measureFps(
    callbacks.reportStat,
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
        -camera.position.x * tileSize,
        -camera.position.y * tileSize,
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
    setCamera(next, time): void {
      if (time !== null) {
        const now =
          performance.timeOrigin + performance.now()
        callbacks.reportStat({
          type: StatType.InputLatency,
          value: now - time,
        })
      }
      camera = next
      tileSize = zoomToTileSize(camera.zoom, viewport)
    },
    setCameraMotion() {},
    setViewport(_next: Viewport): void {
      invariant(false, 'TODO')
    },
    syncChunk(chunk: Chunk): void {
      invariant(!world.chunks[chunk.id])
      world.chunks[chunk.id] = chunk
    },
  }
}
