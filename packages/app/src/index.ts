import { SimulatorStrategy } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initApp } from './app.js'
import './index.scss'

const debug = document.querySelector<HTMLDivElement>(
  '.debug__strategy',
)!
invariant(debug)
const toggle = document.querySelector<HTMLButtonElement>(
  '.debug__toggle',
)!
invariant(toggle)

let strategy: SimulatorStrategy = SimulatorStrategy.Local
let app = await initApp(strategy)
debug.innerText = `strategy: ${strategy}`

async function toggleStrategy() {
  app.destroy()
  if (strategy === SimulatorStrategy.Local) {
    strategy = SimulatorStrategy.WebWorker
  } else {
    strategy = SimulatorStrategy.Local
  }
  app = await initApp(strategy)
  debug.innerText = `strategy: ${strategy}`
}

window.addEventListener('keyup', async (e) => {
  if (e.key === '.') {
    toggleStrategy()
  }
})

toggle.addEventListener('pointerup', toggleStrategy)
