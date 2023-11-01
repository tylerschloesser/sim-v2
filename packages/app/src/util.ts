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
