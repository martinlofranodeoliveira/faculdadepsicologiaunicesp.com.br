type HeaderProps = {
  onOpenPopup?: () => void
}

export function Header({ onOpenPopup }: HeaderProps) {
  return (
    <header className="lp-header" id="inicio">
      <div className="lp-header__inner">
        <a className="lp-logo" href="#inicio" aria-label="Faculdade de Psicologia UNICESP">
          <img
            className="lp-logo__image"
            src="/landing/faculdade-de-psicologia-logo.webp"
            alt="Faculdade de Psicologia UNICESP"
          />
        </a>
        <button type="button" className="lp-header__cta" onClick={onOpenPopup}>
          QUERO ME MATRICULAR
        </button>
      </div>
    </header>
  )
}
