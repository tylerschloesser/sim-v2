export class Vec2 {
  readonly x: number
  readonly y: number

  constructor(x: number = 0, y?: number) {
    this.x = x
    this.y = y ?? x
  }
}
