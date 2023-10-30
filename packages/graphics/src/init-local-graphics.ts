import {
  Graphics,
  GraphicsStrategy,
  InitGraphicsArgs,
} from '@sim-v2/types'
import { initCpuGraphics } from './init-cpu-graphics.js'
import { initGpuGraphics } from './init-gpu-graphics.js'

export function initLocalGraphics({
  strategy,
  ...args
}: Omit<InitGraphicsArgs, 'executor'>): Graphics {
  switch (strategy) {
    case GraphicsStrategy.Cpu:
      return initCpuGraphics(args)
    case GraphicsStrategy.Gpu:
      return initGpuGraphics(args)
  }
}
