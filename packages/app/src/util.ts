export function getDevicePixelRatio() {
  // TODO figure out size for iOS
  // https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/
  //
  const dpr = Math.min(1, window.devicePixelRatio)
  return dpr
}
