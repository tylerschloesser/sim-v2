import { Executor, GraphicsStrategy } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { AppConfig, initApp } from './app.js'
import './index.scss'
import { getDevicePixelRatio } from './util.js'

const dpr = getDevicePixelRatio()
renderDpr()

const DEFAULT_CONFIG: AppConfig = {
  dpr,
  executor: {
    simulator: Executor.Main,
    graphics: Executor.Main,
  },
  strategy: {
    graphics: GraphicsStrategy.Cpu,
  },
}

let config: AppConfig = (() => {
  const json = localStorage.getItem('config')
  if (json) {
    return JSON.parse(json)
  }
  return DEFAULT_CONFIG
})()

let app = await initApp(config)

async function updateApp() {
  app.destroy()
  localStorage.setItem(
    'config',
    JSON.stringify(config, null, 2),
  )
  console.log('reloading app with', config)
  app = await initApp(config)
}

document
  .querySelectorAll<HTMLInputElement>('.toggles input')
  .forEach((input) => {
    let value: string
    switch (input.name) {
      case 'simulator-executor': {
        value = config.executor.simulator
        input.addEventListener('change', () => {
          const executor = input.value as Executor
          invariant(
            Object.values(Executor).includes(executor),
          )
          config.executor.simulator = executor
          updateApp()
        })
        break
      }
      case 'graphics-executor': {
        value = config.executor.graphics
        input.addEventListener('change', () => {
          const executor = input.value as Executor
          invariant(
            Object.values(Executor).includes(executor),
          )
          config.executor.graphics = executor
          updateApp()
        })
        break
      }
      case 'graphics-strategy': {
        value = config.strategy.graphics
        input.addEventListener('change', () => {
          const strategy = input.value as GraphicsStrategy
          invariant(
            Object.values(GraphicsStrategy).includes(
              strategy,
            ),
          )
          config.strategy.graphics = strategy
          updateApp()
        })
        break
      }
      default:
        invariant(
          false,
          `invalid input name: ${input.name}`,
        )
    }
    input.checked = input.value === value
  })

function renderDpr() {
  const element =
    document.querySelector<HTMLSpanElement>('.dpr .value')
  invariant(element)
  element.innerText = `${dpr}`
}
