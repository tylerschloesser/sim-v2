import { Vec2 } from '@sim-v2/math'
import invariant from 'tiny-invariant'

export class PointerMotion {
  i: number = 0
  size: number

  queue: ({
    x: number
    y: number
    time: number
  } | null)[]

  velocity = new Vec2(0, 0)

  constructor(size: number) {
    this.size = size
    this.queue = new Array(size).fill(null)
  }

  push(x: number, y: number, time: number): void {
    let val = this.queue[this.i]
    invariant(val !== undefined)
    if (val === null) {
      val = this.queue[this.i] = { x, y, time }
    } else {
      val.x = x
      val.y = y
      val.time = time
    }

    this.i = (this.i + 1) % this.size
  }

  getVelocity(window: number): Vec2 {
    let count = 0
    this.velocity.x = 0
    this.velocity.y = 0

    const now = performance.now()

    let start = now
    let end = 0

    for (const { x, y, time } of this.queue.filter(
      (v): v is NonNullable<(typeof this.queue)[0]> =>
        v !== null,
    )) {
      if (now - time < window) {
        count += 1
        this.velocity.x += x
        this.velocity.y += y

        if (time < start) {
          start = time
        }
        if (time > end) {
          end = time
        }
      }
    }

    if (count > 1) {
      invariant(start < end)
      invariant(start !== end)
      const dt = start - end

      this.velocity.x /= count / dt
      this.velocity.y /= count / dt
    }

    return this.velocity
  }
}
