export * from './vec2.js'

export function easeOut(k: number): number {
  return 1 - (1 - k) ** 4
}

export function easeIn(k: number): number {
  return k ** 4
}
