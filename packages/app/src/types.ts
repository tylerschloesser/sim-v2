import { Vec2 } from '@sim-v2/math'
import {
  Camera,
  ReportStatFn,
  Viewport,
} from '@sim-v2/types'

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
  start: number,
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
  reportStat: ReportStatFn
}) => void

export type GetViewportFn = () => Viewport
export type GetTileSizeFn = () => number
