type HeaderProps = {
  onOpenPopup?: () => void
}

export function Header({ onOpenPopup }: HeaderProps) {
  return (
    <header className="lp-header" id="inicio">
      <div className="lp-header__inner">
        <div className="lp-header__logos" aria-label="Instituicoes do grupo educacional">
          <a className="lp-header__brand" href="#inicio" aria-label="Faculdade de Psicologia">
            <img
              className="lp-logo__image lp-logo__image--psychology"
              src="/landing/faculdade-de-psicologia-logo.webp"
              alt="Faculdade de Psicologia"
              width={155}
              height={46}
            />
          </a>

          <span className="lp-header__divider lp-header__divider--brand" aria-hidden="true" />

          <div className="lp-header__partner-logos">
            <img
              className="lp-logo__image lp-logo__image--partner lp-logo__image--unicesp"
              src="/landing/logo-faculdade-unicesp.webp"
              alt="Faculdade UNICESP"
              width={126}
              height={44}
            />
            <img
              className="lp-logo__image lp-logo__image--partner lp-logo__image--fasul-group"
              src="/landing/logo-grupo-fasul-educacional.webp"
              alt="Grupo FASUL Educacional"
              width={206}
              height={44}
            />
          </div>
        </div>

        <button type="button" className="lp-header__cta" onClick={onOpenPopup}>
          QUERO ME MATRICULAR
        </button>
      </div>
    </header>
  )
}
