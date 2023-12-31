import {
  Executor,
  GraphicsStrategy,
  Settings,
} from '@sim-v2/types'
import { throttle } from '@sim-v2/util'
import { useEffect, useMemo, useState } from 'react'
import invariant from 'tiny-invariant'
import { initApp } from '../app.js'
import { App, AppConfig } from '../types.js'

declare var __APP_VERSION__: string

const DEFAULT_SETTINGS: Settings = {
  simulator: {
    executor: Executor.Local,
  },
  graphics: {
    executor: Executor.Local,
    strategy: GraphicsStrategy.Gpu,
  },
  app: {
    showToggles: true,
  },
}

interface AppStats {
  fps: number | null
  dpr: number | null
  inputLatency: number | null
  pointerFrequency: number | null
  renderedChunks: number | null
  camera: {
    x: number
    y: number
    zoom: number
  } | null
  version: string
}

function useToggles(
  settings: Settings,
  setSettings: React.Dispatch<
    React.SetStateAction<Settings>
  >,
) {
  return useMemo(() => {
    function onChangeSimulatorExecutor(executor: Executor) {
      return () => {
        setSettings((prev) => ({
          ...prev,
          simulator: {
            ...prev.simulator,
            executor,
          },
        }))
      }
    }

    function onChangeGraphicsExecutor(executor: Executor) {
      return () => {
        setSettings((prev) => ({
          ...prev,
          graphics: {
            ...prev.graphics,
            executor,
          },
        }))
      }
    }

    function onChangeGraphicsStrategy(
      strategy: GraphicsStrategy,
    ) {
      return () => {
        setSettings((prev) => ({
          ...prev,
          graphics: { ...prev.graphics, strategy },
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
              settings.simulator.executor ===
              Executor.Local,
            onChange: onChangeSimulatorExecutor(
              Executor.Local,
            ),
          },
          {
            label: 'Web Worker',
            checked:
              settings.simulator.executor ===
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
              settings.graphics.executor === Executor.Local,
            onChange: onChangeGraphicsExecutor(
              Executor.Local,
            ),
          },
          {
            label: 'Web Worker',
            checked:
              settings.graphics.executor ===
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
              settings.graphics.strategy ===
              GraphicsStrategy.Cpu,
            onChange: onChangeGraphicsStrategy(
              GraphicsStrategy.Cpu,
            ),
          },
          {
            label: 'GPU',
            checked:
              settings.graphics.strategy ===
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
  const [settings, setSettings] = useState<Settings>(
    (() => {
      const json = localStorage.getItem('settings')
      if (json) {
        try {
          return Settings.parse(JSON.parse(json))
        } catch (e) {
          console.error(e)
          if (
            self.confirm(
              'Failed to parse settings. Clear and reload?',
            )
          ) {
            localStorage.removeItem('settings')
            self.location.reload()
          }
        }
      }
      return DEFAULT_SETTINGS
    })(),
  )

  useEffect(() => {
    localStorage.setItem(
      'settings',
      JSON.stringify(settings, null, 2),
    )
  }, [settings])

  const pixelRatio = window.devicePixelRatio

  const [stats, setStats] = useState<AppStats>({
    fps: null,
    dpr: pixelRatio,
    inputLatency: null,
    pointerFrequency: null,
    renderedChunks: null,
    camera: null,
    version: __APP_VERSION__,
  })

  const reportInputLatency = useMemo(
    () =>
      throttle((inputLatency: number) => {
        setStats((prev) =>
          inputLatency === prev.inputLatency
            ? prev
            : {
                ...prev,
                inputLatency,
              },
        )
      }, 100),
    [setStats],
  )

  const reportRenderedChunks = useMemo(
    () =>
      throttle((renderedChunks: number) => {
        setStats((prev) =>
          renderedChunks === prev.renderedChunks
            ? prev
            : {
                ...prev,
                renderedChunks,
              },
        )
      }, 100),
    [setStats],
  )

  const reportCamera = useMemo(
    () =>
      throttle((x: number, y: number, zoom: number) => {
        setStats((prev) => ({
          ...prev,
          camera: { x, y, zoom },
        }))
      }, 100),
    [setStats],
  )

  const config: AppConfig = {
    pixelRatio,
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
          reportInputLatency(value)
          break
        }
        case 'pointer-frequency': {
          setStats((prev) => ({
            ...prev,
            pointerFrequency: value,
          }))
          break
        }
        case 'rendered-chunks': {
          reportRenderedChunks(value)
          break
        }
        case 'camera': {
          reportCamera(
            value.position.x,
            value.position.y,
            value.zoom,
          )
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

    // TODO clean this up. only restart the app if graphics or simulator
    // settings change (i.e. not app settings)
  }, [settings.graphics, settings.simulator, container])

  return (
    <>
      {settings.app.showToggles && (
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
      )}
      <div className="info">
        <div className="dpr">
          DPR: <span className="value">{stats.dpr}</span>
        </div>
        <div className="fps">
          FPS: <span className="value">{stats.fps}</span>
        </div>
        <div className="input-latency">
          Input Latency:{' '}
          <span className="value">
            {stats.inputLatency &&
              `${stats.inputLatency.toFixed(2)}ms`}
          </span>
        </div>
        <div>
          Pointer Frequency:{' '}
          {stats.pointerFrequency?.toFixed(2)}
        </div>
        <div className="rendered-chunks">
          Rendered Chunks:
          <span className="value">
            {stats.renderedChunks}
          </span>
        </div>
        <div className="camera">
          Camera:
          <div className="x">
            x:
            <span className="value">
              {stats.camera?.x.toFixed(2)}
            </span>
          </div>
          <div className="y">
            y:
            <span className="value">
              {stats.camera?.y.toFixed(2)}
            </span>
          </div>
          <div className="zoom">
            zoom:
            <span className="value">
              {stats.camera?.zoom.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={settings.app.showToggles}
            onChange={() => {
              setSettings((prev) => ({
                ...prev,
                app: {
                  ...prev.app,
                  showToggles: !prev.app.showToggles,
                },
              }))
            }}
          />
          Show Toggles
        </label>
      </div>
      <div
        className="canvas-container"
        ref={setContainer}
      />
    </>
  )
}
