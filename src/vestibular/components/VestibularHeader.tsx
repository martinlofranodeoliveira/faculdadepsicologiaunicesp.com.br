type Props = {
  firstName: string
  email: string
}

function UserIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className="vestibular-header__profile-icon">
      <circle cx="18" cy="18" r="18" fill="#000000" />
      <circle cx="18" cy="12.5" r="6.25" fill="#ffffff" />
      <path
        d="M7.5 29.5C8.9 23.9 13 21 18 21C23 21 27.1 23.9 28.5 29.5"
        fill="#ffffff"
      />
    </svg>
  )
}

export function VestibularHeader({ firstName, email }: Props) {
  return (
    <header className="vestibular-header">
      <div className="vestibular-header__inner">
        <a className="vestibular-header__brand" href="/" aria-label="Voltar para a home">
          <img
            src="/landing/faculdade-de-psicologia-logo.webp"
            alt="Faculdade de Psicologia"
            width={129}
            height={36}
            decoding="async"
          />
        </a>

        <div className="vestibular-header__profile" aria-label="Dados do usuário">
          <div className="vestibular-header__profile-text">
            <span className="vestibular-header__profile-name">{firstName || 'Aluno'}</span>
            <span className="vestibular-header__profile-email">
              {email || 'inscricao@faculdadepsicologiaunicesp.com.br'}
            </span>
          </div>
          <UserIcon />
        </div>
      </div>
    </header>
  )
}
