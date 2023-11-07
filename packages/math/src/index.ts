export * from './vec2.js'

export type TimingFn = (k: number) => number

export const easeOut: TimingFn = (k) => {
  return 1 - (1 - k) ** 4
}

export const easeIn: TimingFn = (k) => {
  return k ** 4
}
