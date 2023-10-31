import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { getCpuContext } from './util.js'

enum GraphicsState {
  Started = 'started',
  Stopped = 'stopped',
}

export const initCpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({ canvas, ...args }) => {
  let { viewport, camera } = args
  let state: GraphicsState = GraphicsState.Started

  const context = getCpuContext(canvas)
  context.scale(viewport.pixelRatio, viewport.pixelRatio)

  let frames = 0
  let prev = performance.now()
  let elapsed = 0

  function render(time: number) {
    if (state === GraphicsState.Stopped) {
      return
    }

    const delta = time - prev
    prev = time
    elapsed += delta
    if (elapsed >= 1000) {
      console.log('fps', frames)
      elapsed = elapsed - 1000
      frames = 0
    }
    frames += 1

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
  }

  requestAnimationFrame(render)

  return {
    stop() {
      invariant(state === GraphicsState.Started)
      state = GraphicsState.Stopped
    },
    setCamera(next: Camera): void {
      camera = next
    },
    setViewport(next: Viewport): void {
      invariant(false, 'TODO')
    },
  }
}
