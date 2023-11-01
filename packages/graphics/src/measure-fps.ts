import {
  FpsGraphicsMessage,
  GraphicsMessageType,
} from '@sim-v2/types'

export function measureFps(
  appPort: MessagePort,
  renderFn: (time: number) => void,
) {
  let frames = 0
  let prev = performance.now()
  let elapsed = 0

  return (time: number) => {
    const delta = time - prev
    prev = time
    elapsed += delta
    if (elapsed >= 1000) {
      const message: FpsGraphicsMessage = {
        type: GraphicsMessageType.Fps,
        fps: frames,
      }
      appPort.postMessage(message)

      elapsed = elapsed - 1000
      frames = 0
    }
    frames += 1

    renderFn(time)
  }
}
