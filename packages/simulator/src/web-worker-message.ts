export enum MessageType {
  Init = 'init',
}

export interface InitMessage {
  type: MessageType.Init
}

export type Message = InitMessage
