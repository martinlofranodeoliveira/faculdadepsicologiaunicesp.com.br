type HeaderProps = {
  onOpenPopup?: () => void
}

export function Header({ onOpenPopup }: HeaderProps) {
  return (
    <header className="lp-header" id="inicio">
      <div className="lp-header__inner">
        <a className="lp-header__brand" href="#inicio" aria-label="Faculdade de Psicologia">
          <img
            className="lp-logo__image lp-logo__image--psychology"
            src="/landing/faculdade-de-psicologia-logo.webp"
            alt="Faculdade de Psicologia"
            width={155}
            height={46}
          />
        </a>

        <div className="lp-header__partner-logos" aria-label="Instituições do grupo educacional">
          <img
            className="lp-logo__image lp-logo__image--partner lp-logo__image--fasul-group"
            src="/landing/logo-grupo-fasul-educacional.webp"
            alt="Grupo FASUL Educacional"
            width={206}
            height={44}
          />
          <span className="lp-header__divider" aria-hidden="true" />
          <img
            className="lp-logo__image lp-logo__image--partner lp-logo__image--unicesp"
            src="/landing/logo-faculdade-unicesp.webp"
            alt="Faculdade UNICESP"
            width={126}
            height={44}
          />
          <span className="lp-header__divider" aria-hidden="true" />
          <img
            className="lp-logo__image lp-logo__image--partner lp-logo__image--paulista"
            src="/landing/logo-faculdade-paulista.webp"
            alt="Faculdade Paulista"
            width={141}
            height={44}
          />
          <span className="lp-header__divider" aria-hidden="true" />
          <img
            className="lp-logo__image lp-logo__image--partner lp-logo__image--enfermagem"
            src="/landing/logo-faculdade-de-enfermagem.webp"
            alt="Faculdade de Enfermagem"
            width={155}
            height={44}
          />
        </div>

        <button type="button" className="lp-header__cta" onClick={onOpenPopup}>
          QUERO ME MATRICULAR
        </button>
      </div>
    </header>
  )
}
