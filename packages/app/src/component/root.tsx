import { Executor, GraphicsStrategy } from '@sim-v2/types'
import { throttle } from '@sim-v2/util'
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

export function Root() {
  const [settings] = useState<AppSettings>(
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

  const [app, setApp] = useState<App | null>()

  useEffect(() => {
    ;(async () => {
      app?.destroy()
      // setApp(await initApp({ settings, config }))
    })()
  }, [settings])

  return <pre>{JSON.stringify(settings, null, 2)}</pre>
}
