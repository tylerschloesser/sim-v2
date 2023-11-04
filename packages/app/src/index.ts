import { Executor, GraphicsStrategy } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { initApp } from './app.js'
import './index.scss'
import {
  AppConfig,
  AppSettings,
  ReportCameraFn,
} from './types.js'
import {
  averageInputLatency,
  getPixelRatio,
} from './util.js'

const elements = {
  fps: getSpan('.fps .value'),
  dpr: getSpan('.dpr .value'),
  inputLatency: getSpan('.input-latency .value'),
  renderedChunks: getSpan('.rendered-chunks .value'),
  logWorld: getButton('button.log-world'),
  camera: {
    x: getSpan('.camera .x .value'),
    y: getSpan('.camera .y .value'),
    zoom: getSpan('.camera .zoom .value'),
  },
}

const pixelRatio = getPixelRatio()
elements.dpr.innerText = `${pixelRatio}`

// prettier-ignore
const reportCamera: ReportCameraFn = (camera) => {
  elements.camera.x.innerText = `${camera.position.x.toFixed(2)}`
  elements.camera.y.innerText = `${camera.position.y.toFixed(2)}`
  elements.camera.zoom.innerText = `${camera.zoom.toFixed(2)}`
}

const config: AppConfig = {
  pixelRatio,
  reportStat(key, value) {
    switch (key) {
      case 'rendered-chunks': {
        elements.renderedChunks.innerText = `${value}`
        break
      }
      case 'fps': {
        elements.fps.innerText = `${value}`
        break
      }
      case 'input-latency': {
        const average = averageInputLatency(value)
        // prettier-ignore
        elements.inputLatency.innerText = `${average.toFixed(2)}ms`
      }
    }
  },
  reportCamera,
}

const DEFAULT_SETTINGS: AppSettings = {
  executor: {
    simulator: Executor.Local,
    graphics: Executor.Local,
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
elements.logWorld.onclick = () => {
  app.logWorld()
}

async function updateApp() {
  app.destroy()
  elements.fps.innerText = ''
  elements.inputLatency.innerText = ''
  localStorage.setItem(
    'settings',
    JSON.stringify(settings, null, 2),
  )
  console.log('reloading app with', settings)
  app = await initApp({ settings, config })
  elements.logWorld.onclick = () => {
    app.logWorld()
  }
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

function getSpan(selector: string): HTMLSpanElement {
  const element = document.querySelector(selector)
  invariant(element instanceof HTMLSpanElement)
  return element
}

function getButton(selector: string): HTMLButtonElement {
  const element = document.querySelector(selector)
  invariant(element instanceof HTMLButtonElement)
  return element
}
