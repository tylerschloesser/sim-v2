import invariant from 'tiny-invariant'
import * as z from 'zod'

export const SimpleVec2 = z.object({
  x: z.number(),
  y: z.number(),
})

export type SimpleVec2 = z.infer<typeof SimpleVec2>

export class Vec2 {
  x: number
  y: number

  constructor(x: number | SimpleVec2 = 0, y?: number) {
    if (typeof x === 'number') {
      this.x = x
      this.y = y ?? x
    } else {
      this.x = x.x
      this.y = x.y
    }

    invariant(typeof this.x === 'number')
    invariant(typeof this.y === 'number')
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  simple(): SimpleVec2 {
    return {
      x: this.x,
      y: this.y,
    }
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s)
  }

  div(s: number): Vec2 {
    invariant(s !== 0)
    return new Vec2(this.x / s, this.y / s)
  }
}
