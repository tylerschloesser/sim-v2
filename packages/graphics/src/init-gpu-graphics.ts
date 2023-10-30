import { Graphics, Viewport } from '@sim-v2/types'

export function initGpuGraphics({
  canvas,
  viewport,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}): Graphics {
  return {
    stop() {},
    updatePosition(delta) {},
  }
}
