import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'
import {
  Chunk,
  World,
  WorldUpdate,
  WorldUpdateType,
} from './types.js'

export * from './types.js'
export * from './const.js'

export function applyWorldUpdates(
  world: World,
  updates: WorldUpdate[],
): void {
  for (const update of updates) {
    switch (update.type) {
      case WorldUpdateType.Tick: {
        world.tick = update.tick
        break
      }
      default: {
        invariant(false)
      }
    }
  }
}

const positionCache = new Map<string, Vec2>()

export function getPosition(
  chunk: Chunk,
  world: World,
): Vec2 {
  const key = `${world.chunkSize}.${chunk.id}`
  const cached = positionCache.get(key)
  if (cached) {
    return cached
  }
  const match = chunk.id.match(/(-?\d+)\.(-?\d+)/)
  invariant(match?.length === 3)
  const [x, y] = match.slice(1)
  invariant(x)
  invariant(y)
  const position = new Vec2(parseInt(x), parseInt(y)).mul(
    world.chunkSize,
  )
  positionCache.set(key, position)
  return position
}

export function* iterateTiles(chunk: Chunk, world: World) {
  const { chunkSize } = world
  const position = getPosition(chunk, world)

  invariant(chunk.tiles[0])
  const current = {
    position: position.simple(),
    tile: chunk.tiles[0],
  }

  const { tiles } = chunk
  invariant(tiles.length === chunkSize ** 2)
  for (let i = 0; i < tiles.length; i++) {
    current.position.x = position.x + (i % chunkSize)
    current.position.y =
      position.y + Math.floor(i / chunkSize)
    const tile = tiles[i]
    invariant(tile)
    current.tile = tile
    yield current
  }
}
