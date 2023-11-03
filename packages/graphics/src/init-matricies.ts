import { getTileSize } from '@sim-v2/camera'
import { Vec2 } from '@sim-v2/math'
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
  model: mat4
  view: mat4
  projection: mat4
  updateModel(position: Vec2): void
  updateView(camera: Camera, viewport: Viewport): void
  updateProjection(viewport: Viewport): void
} {
  const model = mat4.create()
  const view = mat4.create()
  const projection = mat4.create()

  updateView(view, camera, viewport)
  updateProjection(projection, viewport)

  const translate = vec3.create()

  return {
    model,
    view,
    projection,
    updateModel(position) {
      translate[0] = position.x
      translate[1] = position.y
      mat4.identity(model)
      mat4.translate(model, model, translate)
    },
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
  const tileSize = getTileSize(camera, viewport)

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
      camera.position.x,
      camera.position.y,
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
