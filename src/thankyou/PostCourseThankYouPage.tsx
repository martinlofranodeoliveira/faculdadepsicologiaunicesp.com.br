import { useEffect, useState } from 'react'

import { readPostThankYouLead, type PostThankYouLead } from './postThankYouState'
import './post-course-thank-you.css'

function UserIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className="post-thankyou__profile-icon">
      <circle cx="18" cy="18" r="18" fill="#000000" />
      <circle cx="18" cy="12.5" r="6.25" fill="#ffffff" />
      <path
        d="M7.5 29.5C8.9 23.9 13 21 18 21C23 21 27.1 23.9 28.5 29.5"
        fill="#ffffff"
      />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 112 112" aria-hidden="true" className="post-thankyou__success-icon">
      <circle cx="56" cy="56" r="56" fill="#4B86F2" />
      <circle cx="56" cy="56" r="43.5" fill="#1E5EC8" />
      <path
        d="M79.4 41.8L50.5 70.7L34.3 54.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getFirstName(fullName?: string) {
  const normalized = fullName?.trim() ?? ''
  if (!normalized) return 'Aluno'
  return normalized.split(/\s+/)[0]
}

export function PostCourseThankYouPage() {
  const [lead, setLead] = useState<PostThankYouLead | null>(null)

  useEffect(() => {
    setLead(readPostThankYouLead())
  }, [])

  const firstName = getFirstName(lead?.fullName)
  const email = lead?.email?.trim() ?? ''

  return (
    <main className="post-thankyou">
      <header className="post-thankyou__header">
        <div className="post-thankyou__header-inner">
          <a className="post-thankyou__brand" href="/" aria-label="Voltar para a home">
            <img
              src="/landing/faculdade-de-psicologia-logo.webp"
              alt="Faculdade de Psicologia"
              width={203}
              height={56}
            />
          </a>

          <div className="post-thankyou__profile" aria-label="Dados do usuário">
            <div className="post-thankyou__profile-text">
              <span className="post-thankyou__profile-name">{firstName}</span>
              <span className="post-thankyou__profile-email">{email || 'inscricao@faculdadepsicologiaunicesp.com.br'}</span>
            </div>
            <UserIcon />
          </div>
        </div>
      </header>

      <section className="post-thankyou__hero" aria-label="Inscrição finalizada">
        <div className="post-thankyou__content">
          <div className="post-thankyou__panel">
            <SuccessIcon />

            <h1 className="post-thankyou__title">
              <span>Inscrição</span>
              <span>Finalizada</span>
            </h1>

            <div className="post-thankyou__message-card">
              <strong>Próximo passo:</strong>
              <p>Nossos Tutores estarão Corrigindo seu Vestibular e em 10 minutos entrarão em contato!!!</p>
            </div>

            <a className="post-thankyou__cta" href="/">
              Voltar para o site
            </a>
          </div>

          <picture className="post-thankyou__media">
            <source media="(max-width: 768px)" srcSet="/course/estudantes-mobile.webp" />
            <img
              src="/course/estudantes.webp"
              alt="Estudantes da Faculdade de Psicologia"
              width={1178}
              height={1178}
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
      </section>
    </main>
  )
}
