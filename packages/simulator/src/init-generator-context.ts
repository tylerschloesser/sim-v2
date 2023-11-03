import Prando from 'prando'
import { createNoise3D } from 'simplex-noise'
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

  const noise3d = createNoise3D(rng.next.bind(rng))
  function noise(x: number, y: number, z: number): number {
    return (noise3d(x, y, z) + 1) / 2
  }

  return { random, noise }
}

export type GeneratorContext = ReturnType<
  typeof initGeneratorContext
>
