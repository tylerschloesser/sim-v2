import invariant from 'tiny-invariant'

export class Vec2 {
  readonly x: number
  readonly y: number

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

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  simple(): SimpleVec2 {
    return [this.x, this.y]
  }
}

export type SimpleVec2 =
  | {
      x: number
      y: number
    }
  | [number, number]
