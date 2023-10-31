import {
  TransferCamera,
  TransferViewport,
} from '@sim-v2/types'

export enum MessageType {
  Init = 'init',
}

export interface InitMessage {
  type: MessageType.Init
  viewport: TransferViewport
  camera: TransferCamera
}

export type Message = InitMessage
