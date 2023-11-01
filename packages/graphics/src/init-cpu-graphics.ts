import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  SimulatorMessage,
  SimulatorMessageType,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { measureFps } from './measure-fps.js'
import { getCpuContext } from './util.js'

export const initCpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({ canvas, simulatorPort, appPort, ...args }) => {
  let { viewport, camera } = args

  const controller = new AbortController()

  simulatorPort.addEventListener('message', (e) => {
    const message = e.data as SimulatorMessage
    switch (message.type) {
      case SimulatorMessageType.SyncChunks: {
        console.log('todo sync chunks', message.chunks)
        break
      }
      default: {
        invariant(false)
      }
    }
  })
  simulatorPort.start()

  const context = getCpuContext(canvas)
  context.scale(viewport.pixelRatio, viewport.pixelRatio)

  const render = measureFps(appPort, (time: number) => {
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
      viewport.size.x / 2 +
        camera.position.x -
        camera.tileSize / 2,
      viewport.size.y / 2 +
        camera.position.y -
        camera.tileSize / 2,
    )
    context.translate(
      camera.tileSize / 2,
      camera.tileSize / 2,
    )
    context.rotate(time / 1000)
    context.translate(
      -camera.tileSize / 2,
      -camera.tileSize / 2,
    )
    context.fillStyle = 'blue'
    context.fillRect(0, 0, camera.tileSize, camera.tileSize)

    context.restore()

    requestAnimationFrame(render)
  })

  requestAnimationFrame(render)

  return {
    stop() {
      controller.abort()
    },
    setCamera(next: Camera): void {
      camera = next
    },
    setViewport(next: Viewport): void {
      invariant(false, 'TODO')
    },
  }
}
