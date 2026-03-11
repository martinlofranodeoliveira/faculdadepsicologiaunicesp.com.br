import { Suspense, lazy } from 'react'

import { LandingPage } from './landing/LandingPage'

const LegalPage = lazy(() =>
  import('./legal/LegalPage').then((module) => ({ default: module.LegalPage })),
)
const ThankYouPage = lazy(() =>
  import('./thank-you/ThankYouPage').then((module) => ({ default: module.ThankYouPage })),
)

function App() {
  const normalizedPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'

  if (normalizedPath === '/politica-de-privacidade') {
    return (
      <Suspense fallback={null}>
        <LegalPage kind="privacy" />
      </Suspense>
    )
  }

  if (normalizedPath === '/termos-de-uso') {
    return (
      <Suspense fallback={null}>
        <LegalPage kind="terms" />
      </Suspense>
    )
  }

  if (normalizedPath === '/obrigado') {
    return (
      <Suspense fallback={null}>
        <ThankYouPage />
      </Suspense>
    )
  }

  return <LandingPage />
}

export default App
