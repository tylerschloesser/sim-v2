import { SimulatorStrategy } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initApp } from './app.js'
import './index.scss'

const debug = document.getElementById('debug')
invariant(debug)

let strategy: SimulatorStrategy = SimulatorStrategy.Local
let app = await initApp(strategy)
debug.innerText = `strategy: ${strategy}`

window.addEventListener('keyup', async (e) => {
  if (e.key === '.') {
    app.destroy()
    if (strategy === SimulatorStrategy.Local) {
      strategy = SimulatorStrategy.WebWorker
    } else {
      strategy = SimulatorStrategy.Local
    }
    app = await initApp(strategy)
    debug.innerText = `strategy: ${strategy}`
  }
})
