import { zoomToTileSize } from '@sim-v2/camera'
import { Camera, Viewport } from '@sim-v2/types'
import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'

export function initMatrices({
  camera,
  viewport,
}: {
  camera: Camera
  viewport: Viewport
}): {
  view: mat4
  projection: mat4
  updateView(camera: Camera, viewport: Viewport): void
  updateProjection(viewport: Viewport): void
} {
  const view = mat4.create()
  const projection = mat4.create()

  updateView(view, camera, viewport)
  updateProjection(projection, viewport)

  return {
    view,
    projection,
    updateView(camera, viewport) {
      updateView(view, camera, viewport)
    },
    updateProjection(_viewport) {
      invariant(false, 'TODO')
    },
  }
}

function updateView(
  view: mat4,
  camera: Camera,
  viewport: Viewport,
): void {
  const tileSize = zoomToTileSize(camera.zoom, viewport)

  mat4.identity(view)

  mat4.translate(
    view,
    view,
    vec3.fromValues(
      viewport.size.x / 2,
      viewport.size.y / 2,
      0,
    ),
  )

  mat4.scale(
    view,
    view,
    vec3.fromValues(tileSize, tileSize, 1),
  )

  mat4.translate(
    view,
    view,
    vec3.fromValues(
      -camera.position.x,
      -camera.position.y,
      0,
    ),
  )
}

function updateProjection(
  projection: mat4,
  viewport: Viewport,
): void {
  mat4.identity(projection)
  mat4.scale(
    projection,
    projection,
    vec3.fromValues(1, -1, 1),
  )
  mat4.translate(
    projection,
    projection,
    vec3.fromValues(-1, -1, 0),
  )
  mat4.scale(
    projection,
    projection,
    vec3.fromValues(2, 2, 2),
  )
  mat4.scale(
    projection,
    projection,
    vec3.fromValues(
      1 / viewport.size.x,
      1 / viewport.size.y,
      1,
    ),
  )
}
