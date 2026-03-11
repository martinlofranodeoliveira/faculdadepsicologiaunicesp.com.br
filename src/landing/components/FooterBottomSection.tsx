const GROUP_LOGOS = [
  {
    src: '/landing/logo-rodape-fasul.webp',
    alt: 'FASUL Educacional',
  },
  {
    src: '/landing/logo-rodape-unicesp.webp',
    alt: 'UNICESP',
  },
  {
    src: '/landing/logo-rodape-faculdade-paulista.webp',
    alt: 'Faculdade Paulista',
  },
  {
    src: '/landing/logo-rodape-enfermagem.webp',
    alt: 'Faculdade de Enfermagem',
  },
]

export function FooterBottomSection() {
  return (
    <footer id="rodape" className="lp-footer-bottom">
      <div className="lp-footer-bottom__inner">
        <div className="lp-footer-bottom__top">
          <section className="lp-footer-brand">
            <img
              className="lp-footer-brand__logo"
              src="/landing/faculdade-de-psicologia-logo-rodape.webp"
              alt="Faculdade de Psicologia"
              loading="lazy"
              decoding="async"
            />

            <p className="lp-footer-brand__description">
              Excelência no ensino superior com foco na inovação e na empregabilidade dos nossos alunos.
            </p>

            <div className="lp-footer-brand__social">
              <a href="#" aria-label="Facebook">
                <img src="/landing/footer-social-1.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
              </a>
              <a href="#" aria-label="Instagram">
                <img src="/landing/footer-social-instagram.png" alt="" aria-hidden="true" loading="lazy" decoding="async" />
              </a>
            </div>

            <div className="lp-footer-brand__group">
              <p className="lp-footer-brand__group-title">Grupo FASUL Educacional</p>

              <div className="lp-footer-brand__group-logos">
                {GROUP_LOGOS.map((logo) => (
                  <div key={logo.src} className="lp-footer-brand__group-logo-card">
                    <img src={logo.src} alt={logo.alt} loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lp-footer-contact-block">
            <h3>Contato</h3>

            <ul>
              <li>
                <img src="/landing/footer-icon-location.svg" alt="" aria-hidden="true" />
                <span>
                  Rua Dr. Diogo de Faria, 66 - Vila Mariana
                  <br />
                  São Paulo - SP, CEP: 04037-000
                </span>
              </li>
              <li>
                <img src="/landing/footer-icon-phone.svg" alt="" aria-hidden="true" />
                <a href="tel:+553598060604">(35) 9806-0604</a>
              </li>
              <li>
                <img src="/landing/footer-icon-mail.svg" alt="" aria-hidden="true" />
                <a href="mailto:contato@faculdadepsicologiaunicesp.com.br">
                  contato@faculdadepsicologiaunicesp.com.br
                </a>
              </li>
            </ul>
          </section>

          <section className="lp-footer-map-block">
            <h3>Localização</h3>

            <div className="lp-footer-map-block__card">
              <img
                src="/landing/footer-map.webp"
                alt="Mapa de localização em São Paulo"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <a
                href="https://maps.google.com/?q=Rua+Dr.+Diogo+de+Faria,+66+-+Vila+Mariana,+S%C3%A3o+Paulo+-+SP,+04037-000"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/landing/footer-icon-maps.svg" alt="" aria-hidden="true" />
                Ver no Maps
              </a>
            </div>
          </section>
        </div>

        <div className="lp-footer-bottom__bar">
          <small>(c) 2026 Faculdade de Psicologia UNICESP. Todos os direitos reservados.</small>

          <div className="lp-footer-bottom__links">
            <a href="/politica-de-privacidade">Política de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
