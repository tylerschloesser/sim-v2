import { Executor, GraphicsStrategy } from '@sim-v2/types'
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

export type FpsCallbackFn = (fps: number) => void
export type InputLatencyCallback = (
  inputLatency: number,
) => void

export interface AppConfig {
  pixelRatio: number
  fpsCallback?: FpsCallbackFn
  inputLatencyCallback?: InputLatencyCallback
}

export interface App {
  destroy(): void
  logWorld(): void
}
