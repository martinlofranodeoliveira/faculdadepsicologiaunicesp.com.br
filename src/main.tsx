import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'

const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim()

if (clarityProjectId) {
  let hasInitializedClarity = false
  const interactionEvents: Array<keyof WindowEventMap> = [
    'pointerdown',
    'keydown',
    'touchstart',
    'scroll',
  ]

  const initClarity = () => {
    if (hasInitializedClarity) return
    hasInitializedClarity = true

    void import('@microsoft/clarity')
      .then(({ default: Clarity }) => {
        Clarity.init(clarityProjectId)
      })
      .catch(() => {
        // Ignora falhas de analytics para não impactar o carregamento inicial.
      })
  }

  const scheduleClarityInit = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initClarity, { timeout: 2000 })
      return
    }

    setTimeout(initClarity, 0)
  }

  const handleInteraction = () => {
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, handleInteraction)
    })
    scheduleClarityInit()
  }

  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleInteraction, { passive: true })
  })

  window.addEventListener('load', () => {
    setTimeout(handleInteraction, 12000)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
