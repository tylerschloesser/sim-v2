import { SimulatorStrategy } from '@sim-v2/types'
import { initApp } from './app.js'
import './index.scss'

let strategy: SimulatorStrategy = SimulatorStrategy.Local
let app = await initApp(strategy)

window.addEventListener('keyup', async (e) => {
  if (e.key === '.') {
    app.destroy()
    if (strategy === SimulatorStrategy.Local) {
      strategy = SimulatorStrategy.WebWorker
    } else {
      strategy = SimulatorStrategy.Local
    }
    app = await initApp(strategy)
  }
})
