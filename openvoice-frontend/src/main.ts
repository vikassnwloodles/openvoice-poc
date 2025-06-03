import './style.css'
import { createRoot } from 'react-dom/client'
import App from '../pages/app';
import { createElement } from 'react'


const container = document.querySelector<HTMLDivElement>('#app')!
const root = createRoot(container)

root.render(createElement(App))
