import { Vec2 } from '@sim-v2/math'
import { Camera, Graphics, Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { getCpuContext } from './util.js'

enum GraphicsState {
  Started = 'started',
  Stopped = 'stopped',
}

export function initCpuGraphics({
  canvas,
  viewport,
  camera,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
  camera: Camera
}): Graphics {
  let state: GraphicsState = GraphicsState.Started

  const context = getCpuContext(canvas)
  context.scale(viewport.scale, viewport.scale)

  let frames = 0
  let prev = performance.now()
  let elapsed = 0

  const size = new Vec2(
    Math.min(viewport.size.x, viewport.size.y),
  ).div(4)

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

    context.translate(camera.position.x, camera.position.y)
    context.translate(size.x / 2, size.y / 2)
    context.rotate(time / 1000)
    context.translate(-size.x / 2, -size.y / 2)
    context.fillStyle = 'blue'
    context.fillRect(0, 0, size.x, size.y)

    context.restore()

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)

  return {
    stop() {
      invariant(state === GraphicsState.Started)
      state = GraphicsState.Stopped
    },
    move(delta) {
      camera.position.madd(delta)
    },
  }
}
