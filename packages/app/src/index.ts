import { SimulatorStrategy } from '@sim-v2/types'
import { initApp } from './app.js'
import './index.scss'

await initApp(SimulatorStrategy.Local)
