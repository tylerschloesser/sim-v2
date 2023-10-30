import { Executor, GraphicsStrategy } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { AppConfig, initApp } from './app.js'
import './index.scss'

let config: AppConfig = {
  executor: {
    simulator: Executor.Main,
    graphics: Executor.Main,
  },
  strategy: {
    graphics: GraphicsStrategy.Cpu,
  },
}

let app = await initApp(config)

async function updateApp() {
  app.destroy()
  console.log('reloading app with', config)
  app = await initApp(config)
}

document
  .querySelectorAll<HTMLInputElement>('.debug input')
  .forEach((input) => {
    input.addEventListener('change', () => {
      switch (input.name) {
        case 'simulator-executor': {
          const executor = input.value as Executor
          invariant(
            Object.values(Executor).includes(executor),
          )
          config.executor.simulator = executor
          break
        }
        case 'graphics-executor': {
          const executor = input.value as Executor
          invariant(
            Object.values(Executor).includes(executor),
          )
          config.executor.graphics = executor
          break
        }
        case 'graphics-strategy': {
          const strategy = input.value as GraphicsStrategy
          invariant(
            Object.values(GraphicsStrategy).includes(
              strategy,
            ),
          )
          config.strategy.graphics = strategy
          break
        }
        default:
          invariant(
            false,
            `invalid input name: ${input.name}`,
          )
      }
      updateApp()
    })
  })
