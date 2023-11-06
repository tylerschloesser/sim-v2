import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

export class PointerMotion {
  i: number = 0
  size: number

  queue: ({
    dx: number
    dy: number
    t0: number
    t1: number
  } | null)[]

  velocity = new Vec2(0, 0)

  constructor(size: number) {
    this.size = size
    this.queue = new Array(size).fill(null)
  }

  push(
    dx: number,
    dy: number,
    t0: number,
    t1: number,
  ): void {
    let val = this.queue[this.i]
    invariant(val !== undefined)
    if (val === null) {
      val = this.queue[this.i] = { dx, dy, t0, t1 }
    } else {
      val.dx = dx
      val.dy = dy
      val.t1 = t1
      val.t0 = t0
    }

    invariant(val.t1 > val.t0)

    this.i = (this.i + 1) % this.size
  }

  getVelocity(window: number): Vec2 {
    this.velocity.x = 0
    this.velocity.y = 0

    const now = performance.now()

    let dt = 0

    for (const { dx, dy, t0, t1 } of this.queue.filter(
      (v): v is NonNullable<(typeof this.queue)[0]> =>
        v !== null,
    )) {
      if (now - t0 < window) {
        this.velocity.x += dx
        this.velocity.y += dy
        dt += t1 - t0
      }
    }

    if (dt > 0) {
      this.velocity.x /= dt
      this.velocity.y /= dt
    }

    return this.velocity
  }
}
