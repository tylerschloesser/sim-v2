import {
  GraphicsStrategy,
  SimulatorStrategy,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initApp } from './app.js'
import './index.scss'

let config: {
  simulatorStrategy: SimulatorStrategy
  graphicsStrategy: GraphicsStrategy
} = {
  simulatorStrategy: SimulatorStrategy.Local,
  graphicsStrategy: GraphicsStrategy.Cpu,
}

let app = await initApp(config)

async function updateApp() {
  app.destroy()
  app = await initApp(config)
}

Object.values(SimulatorStrategy).forEach((strategy) => {
  const input = document.querySelector(
    `input[name="simulator-strategy"][value=${strategy}]`,
  )
  invariant(input)
  input.addEventListener('change', () => {
    config.simulatorStrategy = strategy
    updateApp()
  })
})

Object.values(GraphicsStrategy).forEach((strategy) => {
  const input = document.querySelector(
    `input[name="graphics-strategy"][value=${strategy}]`,
  )
  invariant(input)
  input.addEventListener('change', () => {
    config.graphicsStrategy = strategy
    updateApp()
  })
})
