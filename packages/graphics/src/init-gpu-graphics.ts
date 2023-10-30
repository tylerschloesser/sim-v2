import { Graphics, Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { getGpuContext } from './util.js'
import vert from './vert.glsl'

export function initGpuGraphics({
  canvas,
  viewport,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}): Graphics {
  const gl = getGpuContext(canvas)
  invariant(gl)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  console.log('vert', vert)

  return {
    stop() {},
    move(delta) {},
  }
}
