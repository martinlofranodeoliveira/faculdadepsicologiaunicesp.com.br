import { useState } from 'react'

type HeaderProps = {
  onOpenPopup?: () => void
}

export function Header({ onOpenPopup }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function handleCtaClick() {
    if (typeof window === 'undefined') return

    const currentPath = window.location.pathname
    const isHome = currentPath === '/'
    const isCoursePage =
      (/^\/pos-graduacao\/[^/]+\/?$/i.test(currentPath) && currentPath !== '/pos-graduacao') ||
      (/^\/graduacao\/[^/]+\/?$/i.test(currentPath) && currentPath !== '/graduacao')

    if (isHome && onOpenPopup) {
      onOpenPopup()
      return
    }

    if (isCoursePage) {
      const leadFormElement = document.getElementById('course-lead-form')
      if (leadFormElement) {
        leadFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    window.location.href = '/pos-graduacao'
  }

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current)
  }

  return (
    <>
      <header className="lp-header" id="inicio">
        <div className="lp-header__inner">
          <div className="lp-header__logos" aria-label="Instituicoes do grupo educacional">
            <a className="lp-header__brand" href="/" aria-label="Faculdade de Psicologia">
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

          <div className="lp-header__actions">
            <button type="button" className="lp-header__cta" onClick={handleCtaClick}>
              QUERO ME MATRICULAR
            </button>

            <button
              type="button"
              className="lp-header__menu-toggle"
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <img src="/landing/menu-hamburger.svg" alt="" width={26} height={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay - Dropdown Style */}
      <div className={`lp-mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="lp-mobile-menu__content">
          <nav className="lp-mobile-menu__nav">
            <a href="/" onClick={toggleMenu}>
              Início
            </a>
            <hr />
            <a href="/graduacao/psicologia" onClick={toggleMenu}>
              Graduação Presencial
            </a>
            <hr />
            <a href="/graduacao/psicologia" onClick={toggleMenu}>
              Graduação Semipresencial / EAD
            </a>
            <hr />
            <a href="/pos-graduacao" onClick={toggleMenu}>
              Pós-Graduação EAD
            </a>
            <hr />
            <a href="#fale-conosco" onClick={toggleMenu}>
              Fale Conosco
            </a>
            <hr />
          </nav>

          <div className="lp-mobile-menu__footer">
            <div className="lp-mobile-menu__brand-unicesp">
              <img src="/landing/logo-header-faculdade-unicesp.webp" alt="UNICESP" />
            </div>
            <div className="lp-mobile-menu__brand-fasul">
              <img src="/landing/logo-grupo-fasul-educacional.webp" alt="Grupo FASUL Educacional" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
