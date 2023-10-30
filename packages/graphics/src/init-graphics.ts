import {
  Graphics,
  GraphicsStrategy,
  Viewport,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initCpuGraphics } from './init-cpu-graphics.js'

export function initGraphics({
  strategy,
  ...args
}: {
  strategy: GraphicsStrategy
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}): Graphics {
  switch (strategy) {
    case GraphicsStrategy.Cpu:
      return initCpuGraphics(args)
    case GraphicsStrategy.Gpu:
      invariant(false, 'TODO')
  }
}
