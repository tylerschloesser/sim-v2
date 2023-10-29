import { App } from './app.js'
import './index.scss'

console.log('hello from app')

const app = await App.init()

await app.connect()
console.log('app connected to worker')

await app.createWorld()
