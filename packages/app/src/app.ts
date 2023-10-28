import { AppToWorkerApi } from '@sim-v2/api'

export class App {
  private readonly worker: AppToWorkerApi

  constructor() {
    this.worker = {
      connect() {},
      createWorld() {},
    }
  }
}
