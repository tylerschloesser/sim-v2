import {
  GraphicsStrategy,
  SimulatorStrategy,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initApp } from './app.js'
import './index.scss'

const graphicsStrategy: GraphicsStrategy =
  GraphicsStrategy.Cpu

const debug = document.querySelector<HTMLDivElement>(
  '.debug__strategy',
)!
invariant(debug)
const toggle = document.querySelector<HTMLButtonElement>(
  '.debug__toggle',
)!
invariant(toggle)

let simulatorStrategy: SimulatorStrategy =
  SimulatorStrategy.Local
let app = await initApp({
  simulatorStrategy,
  graphicsStrategy,
})
debug.innerText = `strategy: ${simulatorStrategy}`

async function toggleStrategy() {
  app.destroy()
  if (simulatorStrategy === SimulatorStrategy.Local) {
    simulatorStrategy = SimulatorStrategy.WebWorker
  } else {
    simulatorStrategy = SimulatorStrategy.Local
  }
  app = await initApp({
    simulatorStrategy,
    graphicsStrategy,
  })
  debug.innerText = `strategy: ${simulatorStrategy}`
}

window.addEventListener('keyup', async (e) => {
  if (e.key === '.') {
    toggleStrategy()
  }
})

toggle.addEventListener('pointerup', toggleStrategy)
