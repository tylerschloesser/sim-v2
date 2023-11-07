import { Executor, GraphicsStrategy } from '@sim-v2/types'
import { useEffect, useMemo, useState } from 'react'
import invariant from 'tiny-invariant'
import { initApp } from '../app.js'
import { App, AppConfig, AppSettings } from '../types.js'

declare var __APP_VERSION__: string

const DEFAULT_SETTINGS: AppSettings = {
  executor: {
    simulator: Executor.Local,
    graphics: Executor.Local,
  },
  strategy: {
    graphics: GraphicsStrategy.Cpu,
  },
}

interface AppStats {
  fps: number | null
  dpr: number | null
  inputLatency: number | null
  renderedChunks: number | null
  camera: {
    x: number
    y: number
    zoom: number
  } | null
  version: string
}

function useToggles(
  settings: AppSettings,
  setSettings: React.Dispatch<
    React.SetStateAction<AppSettings>
  >,
) {
  return useMemo(() => {
    function onChangeSimulatorExecutor(
      simulator: Executor,
    ) {
      return () => {
        setSettings((prev) => ({
          ...prev,
          executor: {
            ...prev.executor,
            simulator,
          },
        }))
      }
    }

    function onChangeGraphicsExecutor(graphics: Executor) {
      return () => {
        setSettings((prev) => ({
          ...prev,
          executor: {
            ...prev.executor,
            graphics,
          },
        }))
      }
    }

    function onChangeGraphicsStrategy(
      graphics: GraphicsStrategy,
    ) {
      return () => {
        setSettings((prev) => ({
          ...prev,
          strategy: { ...prev.strategy, graphics },
        }))
      }
    }

    return [
      {
        legend: 'Simulator Executor',
        values: [
          {
            label: 'Main',
            checked:
              settings.executor.simulator ===
              Executor.Local,
            onChange: onChangeSimulatorExecutor(
              Executor.Local,
            ),
          },
          {
            label: 'Web Worker',
            checked:
              settings.executor.simulator ===
              Executor.WebWorker,
            onChange: onChangeSimulatorExecutor(
              Executor.WebWorker,
            ),
          },
        ],
      },
      {
        legend: 'Graphics Executor',
        values: [
          {
            label: 'Main',
            checked:
              settings.executor.graphics === Executor.Local,
            onChange: onChangeGraphicsExecutor(
              Executor.Local,
            ),
          },
          {
            label: 'Web Worker',
            checked:
              settings.executor.graphics ===
              Executor.WebWorker,
            onChange: onChangeGraphicsExecutor(
              Executor.WebWorker,
            ),
          },
        ],
      },
      {
        legend: 'Graphics Strategy',
        values: [
          {
            label: 'CPU',
            checked:
              settings.strategy.graphics ===
              GraphicsStrategy.Cpu,
            onChange: onChangeGraphicsStrategy(
              GraphicsStrategy.Cpu,
            ),
          },
          {
            label: 'GPU',
            checked:
              settings.strategy.graphics ===
              GraphicsStrategy.Gpu,
            onChange: onChangeGraphicsStrategy(
              GraphicsStrategy.Gpu,
            ),
          },
        ],
      },
    ]
  }, [settings, setSettings])
}

export function Root() {
  const [settings, setSettings] = useState<AppSettings>(
    (() => {
      const json = localStorage.getItem('settings')
      if (json) {
        return AppSettings.parse(JSON.parse(json))
      }
      return DEFAULT_SETTINGS
    })(),
  )

  const [stats, setStats] = useState<AppStats>({
    fps: null,
    dpr: null,
    inputLatency: null,
    renderedChunks: null,
    camera: null,
    version: __APP_VERSION__,
  })

  const config: AppConfig = {
    pixelRatio: window.devicePixelRatio,
    reportStat: ({ type, value }) => {
      switch (type) {
        case 'fps': {
          setStats((prev) => ({
            ...prev,
            fps: value,
          }))
          break
        }
        case 'input-latency': {
          setStats((prev) => ({
            ...prev,
            inputLatency: value,
          }))
          break
        }
        case 'rendered-chunks': {
          setStats((prev) => ({
            ...prev,
            renderedChunks: value,
          }))
          break
        }
        case 'camera': {
          setStats((prev) => ({
            ...prev,
            camera: {
              x: value.position.x,
              y: value.position.y,
              zoom: value.zoom,
            },
          }))
          break
        }
        default: {
          invariant(false)
        }
      }
    },
  }

  const toggles = useToggles(settings, setSettings)

  const [container, setContainer] =
    useState<HTMLDivElement | null>(null)

  const [app, setApp] = useState<App | null>()

  useEffect(() => {
    if (app) {
      return () => {
        app.destroy()
      }
    }
  }, [app])

  useEffect(() => {
    if (!container) {
      return
    }
    initApp({ settings, config, container }).then(setApp)
  }, [settings, container])

  return (
    <div>
      <div className="toggles">
        {toggles.map(({ legend, values }, i) => (
          <fieldset key={i}>
            <legend>{legend}</legend>
            {values.map(
              ({ label, checked, onChange }, j) => (
                <label key={j}>
                  <input
                    type="radio"
                    onChange={onChange}
                    checked={checked}
                  />
                  {label}
                </label>
              ),
            )}
          </fieldset>
        ))}
      </div>
      <div
        className="canvas-container"
        ref={setContainer}
      />
    </div>
  )
}
