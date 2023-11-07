import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { Root } from './component/root.js'
import './index.scss'

declare var __APP_VERSION__: string
console.debug('version:', __APP_VERSION__)

const container = document.getElementById('root')
invariant(container)
const root = createRoot(container)
root.render(<Root />)
