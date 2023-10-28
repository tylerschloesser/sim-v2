import { App } from './app.js'
import './index.scss'

console.log('hello from app')

const worker = new Worker(
  new URL('./worker.ts', import.meta.url),
)

const app = new App(worker)

await app.connect()
console.log('app connected to worker')

await app.createWorld()
