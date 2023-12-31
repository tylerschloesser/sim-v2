import { Executor, InitGraphicsFn } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initLocalGraphics } from './init-local-graphics.js'
import { initWebWorkerGraphics } from './init-web-worker-graphics.js'

export const initGraphics: InitGraphicsFn = (args) => {
  switch (args.settings.executor) {
    case Executor.Local:
      return initLocalGraphics(args)
    case Executor.WebWorker:
      invariant(args.canvas instanceof HTMLCanvasElement)
      return initWebWorkerGraphics({
        ...args,
        canvas: args.canvas.transferControlToOffscreen(),
      })
  }
}
