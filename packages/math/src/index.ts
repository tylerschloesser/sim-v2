export * from './vec2.js'

export type TimingFn = (k: number) => number

export const easeOut: TimingFn = (k) => {
  return 1 - (1 - k) ** 2
}

export const easeIn: TimingFn = (k) => {
  return k ** 2
}

export const easeInOut: TimingFn = (k: number) => {
  return 1 - 0.5 * (Math.sin((k - 0.5) * Math.PI) + 1)
}

console.log(easeInOut(0.1))

export const linear: TimingFn = (k) => k
