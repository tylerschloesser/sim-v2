import {
  GraphicsMessageType,
  InputLatencyGraphicsMessage,
} from '@sim-v2/types'

export function checkInputLatency(
  appPort: MessagePort,
  time: number,
): void {
  const now = performance.timeOrigin + performance.now()
  const message: InputLatencyGraphicsMessage = {
    type: GraphicsMessageType.InputLatency,
    inputLatency: now - time,
  }
  appPort.postMessage(message)
}
