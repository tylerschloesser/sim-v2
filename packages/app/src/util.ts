import invariant from 'tiny-invariant'

export function getDevicePixelRatio() {
  // TODO figure out size for iOS
  // https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/
  //
  // Actually, this seems to be okay with initial-scale=1...
  //
  const dpr = window.devicePixelRatio
  invariant(typeof dpr === 'number')
  return dpr
}
