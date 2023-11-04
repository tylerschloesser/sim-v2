import { RenderFn, ReportStatFn } from '@sim-v2/types'

export function measureFps(
  reportStat: ReportStatFn,
  render: RenderFn,
) {
  let frames = 0
  let prev = performance.now()
  let elapsed = 0

  return (time: number) => {
    const delta = time - prev
    prev = time
    elapsed += delta
    if (elapsed >= 1000) {
      reportStat('fps', frames)
      elapsed = elapsed - 1000
      frames = 0
    }
    frames += 1

    render(time)
  }
}
