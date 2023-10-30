import { Executor, GraphicsStrategy } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { AppConfig, AppSettings, initApp } from './app.js'
import './index.scss'
import { getDevicePixelRatio } from './util.js'

const dpr = getDevicePixelRatio()
renderDpr()

const config: AppConfig = { dpr }

const DEFAULT_SETTINGS: AppSettings = {
  executor: {
    simulator: Executor.Main,
    graphics: Executor.Main,
  },
  strategy: {
    graphics: GraphicsStrategy.Cpu,
  },
}

let settings: AppSettings = (() => {
  const json = localStorage.getItem('settings')
  if (json) {
    return AppSettings.parse(JSON.parse(json))
  }
  return DEFAULT_SETTINGS
})()

let app = await initApp({ settings, config })

async function updateApp() {
  app.destroy()
  localStorage.setItem(
    'settings',
    JSON.stringify(settings, null, 2),
  )
  console.log('reloading app with', settings)
  app = await initApp({ settings, config })
}

document
  .querySelectorAll<HTMLInputElement>('.toggles input')
  .forEach((input) => {
    let value: string
    switch (input.name) {
      case 'simulator-executor': {
        value = settings.executor.simulator
        input.addEventListener('change', () => {
          const executor = input.value as Executor
          invariant(
            Object.values(Executor).includes(executor),
          )
          settings.executor.simulator = executor
          updateApp()
        })
        break
      }
      case 'graphics-executor': {
        value = settings.executor.graphics
        input.addEventListener('change', () => {
          const executor = input.value as Executor
          invariant(
            Object.values(Executor).includes(executor),
          )
          settings.executor.graphics = executor
          updateApp()
        })
        break
      }
      case 'graphics-strategy': {
        value = settings.strategy.graphics
        input.addEventListener('change', () => {
          const strategy = input.value as GraphicsStrategy
          invariant(
            Object.values(GraphicsStrategy).includes(
              strategy,
            ),
          )
          settings.strategy.graphics = strategy
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
