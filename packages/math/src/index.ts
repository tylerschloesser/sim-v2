import invariant from 'tiny-invariant'

export * from './vec2.js'

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
