import invariant from 'tiny-invariant'
import {
  World,
  WorldUpdate,
  WorldUpdateType,
} from './types.js'

export * from './types.js'

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
