import { z } from 'zod'

export enum Executor {
  Local = 'main',
  WebWorker = 'web-worker',
}

export enum GraphicsStrategy {
  Cpu = 'cpu',
  Gpu = 'gpu',
}

export const SimulatorSettings = z.object({
  executor: z.nativeEnum(Executor),
})
export type SimulatorSettings = z.infer<
  typeof SimulatorSettings
>

export const GraphicsSettings = z.object({
  executor: z.nativeEnum(Executor),
  strategy: z.nativeEnum(GraphicsStrategy),
})
export type GraphicsSettings = z.infer<
  typeof GraphicsSettings
>

export const AppSettings = z.object({
  showToggles: z.boolean(),
})
export type AppSettings = z.infer<typeof AppSettings>

export const Settings = z.object({
  simulator: SimulatorSettings,
  graphics: GraphicsSettings,
  app: AppSettings,
})
export type Settings = z.infer<typeof Settings>
