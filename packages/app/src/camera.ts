import { Vec2 } from '@sim-v2/math'
import { Camera, SimpleCamera } from '@sim-v2/types'
import invariant from 'tiny-invariant'

const KEY = 'camera'

export function loadCamera(): Camera<Vec2> {
  const json = self.localStorage.getItem(KEY)
  if (!json) {
    console.debug('creating new camera')
    return {
      position: new Vec2(0),
      zoom: 0.25,
    }
  }

  console.debug('loading existing camera')

  let simple: SimpleCamera
  try {
    simple = SimpleCamera.parse(JSON.parse(json))
  } catch (e) {
    console.error(e)
    if (
      self.confirm(
        'Failed to parse camera. Clear and reload?',
      )
    ) {
      self.localStorage.removeItem(KEY)
      self.location.reload()
    }
    invariant(false)
  }

  return {
    position: new Vec2(simple.position),
    zoom: simple.zoom,
  }
}

export function saveCamera(camera: Camera<Vec2>): void {
  console.debug('saving camera')
  const simple: SimpleCamera = {
    position: camera.position.simple(),
    zoom: camera.zoom,
  }
  self.localStorage.setItem(
    KEY,
    JSON.stringify(simple, null, 2),
  )
}
