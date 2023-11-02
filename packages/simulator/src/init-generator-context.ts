import Prando from 'prando'
import invariant from 'tiny-invariant'

export function initGeneratorContext(seed: string) {
  const rng = new Prando(seed)

  function random(): number
  function random<T>(arr: T[]): T
  function random<T>(arr?: T[]) {
    if (Array.isArray(arr)) {
      invariant(arr.length > 0)
      return arr[Math.floor(rng.next() * arr.length)]
    }
    return rng.next()
  }

  return { random }
}

export type GeneratorContext = ReturnType<
  typeof initGeneratorContext
>
