import { Vec2 } from '@sim-v2/math'
import {
  Camera,
  Executor,
  GraphicsStrategy,
  ReportFpsFn,
  ReportInputLatencyFn,
  Viewport,
} from '@sim-v2/types'
import { z } from 'zod'

export const AppSettings = z.object({
  executor: z.object({
    simulator: z.nativeEnum(Executor),
    graphics: z.nativeEnum(Executor),
  }),
  strategy: z.object({
    graphics: z.nativeEnum(GraphicsStrategy),
  }),
})
export type AppSettings = z.infer<typeof AppSettings>

export interface AppConfig {
  pixelRatio: number
  reportFps: ReportFpsFn
  reportInputLatency: ReportInputLatencyFn
}

export interface App {
  destroy(): void
  logWorld(): void
}

export type SetCameraFn = (
  camera: Camera<Vec2>,
  time: number,
) => void

export type GetViewportFn = () => Viewport
export type GetTileSizeFn = () => number
