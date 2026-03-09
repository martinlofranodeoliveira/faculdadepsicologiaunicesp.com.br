import Clarity from '@microsoft/clarity'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'

const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim()

if (clarityProjectId) {
  Clarity.init(clarityProjectId)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
