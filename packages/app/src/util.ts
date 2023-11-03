import invariant from 'tiny-invariant'

export function getPixelRatio() {
  // TODO figure out size for iOS
  // https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/
  //
  // Actually, this seems to be okay with initial-scale=1...
  //
  const pixelRatio = window.devicePixelRatio
  invariant(typeof pixelRatio === 'number')
  return pixelRatio
}

// report the input latency as the average of the last N values
//
export const averageInputLatency = (() => {
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
