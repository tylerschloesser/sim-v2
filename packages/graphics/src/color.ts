import Color from 'color'

type ColorArray = [number, number, number, number]

const cache = new Map<string, ColorArray>()

export function colorStringToArray(
  str: string,
): ColorArray {
  const cached = cache.get(str)
  if (cached) {
    return cached
  }
  const color = new Color(str)
  const arr: ColorArray = [
    color.red() / 255,
    color.green() / 255,
    color.blue() / 255,
    color.alpha(),
  ]
  cache.set(str, arr)
  return arr
}
