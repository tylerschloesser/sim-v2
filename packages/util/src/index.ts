import invariant from 'tiny-invariant'

export function clamp(
  v: number,
  min: number,
  max: number,
): number {
  return Math.min(max, Math.max(v, min))
}

export function random<T>(arr: Array<T>): T {
  const value = arr.at(
    Math.floor(Math.random() * arr.length),
  )
  invariant(typeof value !== 'undefined')
  return value
}

export function memo<T, U>(
  fn: (key: T) => U,
): (key: T) => U {
  const cache = new Map<T, U>()
  return (key: T) => {
    let value = cache.get(key)
    if (value !== undefined) {
      return value
    }
    value = fn(key)
    cache.set(key, value)
    return value
  }
}

export function timeout(ms: number): Promise<void> {
  return new Promise((_resolve, reject) => {
    setTimeout(reject, ms)
  })
}

const cache = new Map()

export function throttle<A extends Array<unknown>>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let timeout: number | undefined
  let use: A

  const cached = cache.get(fn)
  if (cached) {
    return cached
  }

  const throttled = (...args: A) => {
    use = args
    if (!timeout) {
      timeout = self.setTimeout(() => {
        fn(...use)
        timeout = undefined
      }, ms)
    }
  }

  cache.set(fn, throttled)
  return throttled
}
