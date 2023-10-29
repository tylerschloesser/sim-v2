import { Vec2 } from '@sim-v2/math'
import {
  ISimulator,
  Simulator,
  WebWorkerBridge,
} from '@sim-v2/simulator'
import { SimulatorStrategy } from '@sim-v2/types'
import { getDevicePixelRatio } from './util.js'

export async function initApp(
  strategy: SimulatorStrategy,
): Promise<void> {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)

  const rect = document.body.getBoundingClientRect()

  const dpr = getDevicePixelRatio()

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const viewport = {
    size: new Vec2(rect.width, rect.height),
    scale: dpr,
  }

  let simulator: ISimulator
  switch (strategy) {
    case SimulatorStrategy.Local:
      simulator = new Simulator({ canvas, viewport })
      break
    case SimulatorStrategy.WebWorker:
      simulator = new WebWorkerBridge({ canvas, viewport })
      break
  }

  let prev: PointerEvent | null = null

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons === 1) {
      if (prev) {
        const delta = new Vec2(
          e.clientX - prev.clientX,
          e.clientY - prev.clientY,
        )
        simulator.move({ delta })
      }
      prev = e
    }
  })

  canvas.addEventListener('pointerup', () => {
    prev = null
  })

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
  })

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
    },
    { passive: false },
  )

  simulator.start()
}
