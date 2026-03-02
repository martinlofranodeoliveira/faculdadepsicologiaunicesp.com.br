import { LandingPage } from './landing/LandingPage'
import { LegalPage } from './legal/LegalPage'

function App() {
  const normalizedPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'

  if (normalizedPath === '/politica-de-privacidade') {
    return <LegalPage kind="privacy" />
  }

  if (normalizedPath === '/termos-de-uso') {
    return <LegalPage kind="terms" />
  }

  return <LandingPage />
}

export default App
