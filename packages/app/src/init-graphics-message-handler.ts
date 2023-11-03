import {
  GraphicsMessage,
  GraphicsMessageType,
} from '@sim-v2/types'
import invariant from 'tiny-invariant'
import { AppConfig } from './types.js'

export function initGraphicsMessageHandler({
  config,
  graphicsPort,
}: {
  config: AppConfig
  graphicsPort: MessagePort
}): void {
  // report the input latency as the average of the last N values
  //
  const averageInputLatency = (() => {
    const count = 20
    let i = 0
    const prev = new Array<number | null>(count).fill(null)
    return (inputLatency: number) => {
      prev[i] = inputLatency
      i = (i + 1) % count
      const average =
        prev
          .filter((v): v is number => v !== null)
          .reduce((acc, v) => acc + v, 0) / prev.length
      return average
    }
  })()

  graphicsPort.addEventListener('message', (e) => {
    const message = e.data as GraphicsMessage
    switch (message.type) {
      case GraphicsMessageType.InputLatency: {
        config.inputLatencyCallback?.(
          averageInputLatency(message.inputLatency),
        )
        break
      }
      default: {
        invariant(false)
      }
    }
  })
  graphicsPort.start()
}
