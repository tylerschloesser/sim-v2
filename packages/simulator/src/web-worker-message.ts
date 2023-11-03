import { SimpleVec2 } from '@sim-v2/math'
import {
  Camera,
  InitSimulatorArgs,
  Viewport,
} from '@sim-v2/types'
import { World } from '@sim-v2/world'

export enum MessageType {
  InitRequest = 'init-request',
  InitResponse = 'init-response',
  Start = 'start',
  SetCamera = 'set-camera',
  SetViewport = 'set-viewport',
  LogWorld = 'log-world',
}

export type InitRequestMessage = {
  type: MessageType.InitRequest
} & Omit<
  InitSimulatorArgs<SimpleVec2>,
  'executor' | 'callbacks'
>

export interface InitResponseMessage {
  type: MessageType.InitResponse
  world: World
}

export interface StartMessage {
  type: MessageType.Start
}

export interface SetCameraMessage {
  type: MessageType.SetCamera
  camera: Camera<SimpleVec2>
}

export interface SetViewportMessage {
  type: MessageType.SetViewport
  viewport: Viewport<SimpleVec2>
}

export interface LogWorldMessage {
  type: MessageType.LogWorld
}

export type Message =
  | InitRequestMessage
  | InitResponseMessage
  | StartMessage
  | SetCameraMessage
  | SetViewportMessage
  | LogWorldMessage
