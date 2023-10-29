import invariant from 'tiny-invariant'

export function getContext(
  canvas: OffscreenCanvas | HTMLCanvasElement,
):
  | OffscreenCanvasRenderingContext2D
  | CanvasRenderingContext2D {
  let context:
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null

  // It's important to check for OffscreenCanvas type first.
  // OffscreenCanvas is available on both main thread and the
  // web worker. HTMLCanvasElement is ONLY available on the
  // main thread.
  //
  if (canvas instanceof OffscreenCanvas) {
    context = canvas.getContext('2d')
  } else {
    invariant(canvas instanceof HTMLCanvasElement)
    context = canvas.getContext('2d')
  }
  invariant(context)
  return context
}
