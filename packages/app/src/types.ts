import { Vec2 } from '@sim-v2/math'
import {
  Camera,
  Executor,
  GraphicsStrategy,
  ReportStatFn,
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
  reportStat: ReportStatFn
}

export interface App {
  destroy(): void
  logWorld(): void
}

export type SetCameraFn = (
  camera: Camera<Vec2>,
  time: number | null,
) => void

export type SetCameraMotionFn = (
  vx: number,
  vy: number,
) => void

export type InitCanvasEventListenersFn = (args: {
  canvas: HTMLCanvasElement
  camera: Camera
  setCamera: SetCameraFn
  setCameraMotion: SetCameraMotionFn
  cancelCameraMotion(): void
  getViewport: GetViewportFn
  getTileSize: GetTileSizeFn
  signal: AbortSignal
}) => void

export type GetViewportFn = () => Viewport
export type GetTileSizeFn = () => number
