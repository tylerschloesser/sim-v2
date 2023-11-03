import { Vec2 } from '@sim-v2/math'
import { Camera, SimpleCamera } from '@sim-v2/types'
import { throttle } from '@sim-v2/util'

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

  const simple = SimpleCamera.parse(JSON.parse(json))

  return {
    position: new Vec2(simple.position),
    zoom: simple.zoom,
  }
}

export const saveCamera = throttle(
  (camera: Camera<Vec2>): void => {
    const simple: SimpleCamera = {
      position: camera.position.simple(),
      zoom: camera.zoom,
    }
    self.localStorage.setItem(
      KEY,
      JSON.stringify(simple, null, 2),
    )
  },
  1000,
)
