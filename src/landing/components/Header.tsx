type HeaderProps = {
  onOpenPopup?: () => void
}

export function Header({ onOpenPopup }: HeaderProps) {
  return (
    <header className="lp-header" id="inicio">
      <div className="lp-header__inner">
        <a className="lp-header__brand" href="#inicio" aria-label="Faculdade de Psicologia UNICESP FASUL">
          <div className="lp-header__brand-logos">
            <img
              className="lp-logo__image lp-logo__image--psychology"
              src="/landing/faculdade-de-psicologia-logo.webp"
              alt="Faculdade de Psicologia"
            />
            <span className="lp-header__divider" aria-hidden="true" />
            <img
              className="lp-logo__image lp-logo__image--unicesp"
              src="/landing/unicesp-logo.webp"
              alt="UNICESP"
            />
            <span className="lp-header__divider" aria-hidden="true" />
            <img
              className="lp-logo__image lp-logo__image--fasul"
              src="/landing/fasul-logo.webp"
              alt="FASUL"
            />
          </div>
        </a>
        <button type="button" className="lp-header__cta" onClick={onOpenPopup}>
          QUERO ME MATRICULAR
        </button>
      </div>
    </header>
  )
}
