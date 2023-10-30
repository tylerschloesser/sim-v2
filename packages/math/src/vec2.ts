import invariant from 'tiny-invariant'

export class Vec2 {
  x: number
  y: number

  constructor(x: number | SimpleVec2 = 0, y?: number) {
    if (typeof x === 'number') {
      this.x = x
      this.y = y ?? x
    } else if (Array.isArray(x)) {
      invariant(x.length === 2)
      this.x = x[0]
      this.y = x[1]
    } else {
      this.x = x.x
      this.y = x.y
    }

    invariant(typeof this.x === 'number')
    invariant(typeof this.y === 'number')
  }

  madd(v: Vec2 | SimpleVec2): void {
    if (Array.isArray(v)) {
      invariant(v.length === 2)
      invariant(typeof v[0] === 'number')
      invariant(typeof v[1] === 'number')
      this.x += v[0]
      this.x += v[1]
    } else {
      this.x += v.x
      this.y += v.y
    }
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  simple(): SimpleVec2 {
    return [this.x, this.y]
  }

  div(s: number): Vec2 {
    invariant(s !== 0)
    return new Vec2(this.x / s, this.y / s)
  }
}

export type SimpleVec2 =
  | {
      x: number
      y: number
    }
  | [number, number]
