export function FooterBottomSection() {
  return (
    <footer id="rodape" className="lp-footer-bottom">
      <div className="lp-footer-bottom__inner">
        <div className="lp-footer-bottom__top">
          <section className="lp-footer-brand">
            <div className="lp-footer-brand__logo-wrap">
              <img
                className="lp-footer-brand__logo"
                src="/landing/faculdade-de-psicologia-logo.webp"
                alt="Faculdade de Psicologia"
              />
            </div>

            <p className="lp-footer-brand__description">
              Excelencia no ensino superior com foco na inovacao e na empregabilidade dos nossos alunos.
            </p>

            <div className="lp-footer-brand__social">
              <a href="#" aria-label="Facebook">
                <img src="/landing/footer-social-1.svg" alt="" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Instagram">
                <img src="/landing/footer-social-instagram.png" alt="" aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="lp-footer-contact-block">
            <h3>Contato</h3>

            <ul>
              <li>
                <img src="/landing/footer-icon-location.svg" alt="" aria-hidden="true" />
                <span>
                  Av. Alvaro Ramos, 1200
                  <br />
                  Belem - Sao Paulo, SP
                </span>
              </li>
              <li>
                <img src="/landing/footer-icon-phone.svg" alt="" aria-hidden="true" />
                <a href="tel:+551140028922">(11) 4002-8922</a>
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
            <h3>Localizacao</h3>

            <div className="lp-footer-map-block__card">
              <img src="/landing/footer-map.png" alt="Mapa de localizacao em Sao Paulo" />
              <a
                href="https://maps.google.com/?q=Av.+Alvaro+Ramos,+1200+Belem+-+Sao+Paulo,+SP"
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
            <a href="/politica-de-privacidade">Politica de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
