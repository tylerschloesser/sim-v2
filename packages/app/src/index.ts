import { SimulatorStrategy } from '@sim-v2/types'
import { initApp } from './app.js'
import './index.scss'

let strategy: SimulatorStrategy = SimulatorStrategy.Local

window.addEventListener('keyup', (e) => {
  if (e.key === '.') {
    console.log('todo toggle simulator strategy')
  }
})

await initApp(strategy)
