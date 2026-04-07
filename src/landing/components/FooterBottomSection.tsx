import { siteConfig } from '@/site/config'
import { FaleConoscoSection } from './FaleConoscoSection'

export function FooterBottomSection() {
  return (
    <>
      <footer id="rodape" className="lp-footer-bottom">
      <div className="lp-footer-bottom__inner">
        <div className="lp-footer-bottom__top">
          <section className="lp-footer-brand">
            <div className="lp-footer-brand__logos">
              <img
                className="lp-footer-brand__logo"
                src="/landing/logo-rodape-faculdade-de-psicologia.webp"
                alt="Faculdade de Psicologia"
                loading="lazy"
                decoding="async"
              />
              <div className="lp-footer-brand__logos-divider" />
              <img
                className="lp-footer-brand__logo lp-footer-brand__logo--unicesp"
                src="/landing/logo-rodape-faculdade-fasul.webp"
                alt="Faculdade Fasul"
                loading="lazy"
                decoding="async"
              />
            </div>

            <p className="lp-footer-brand__description">
              A Faculdade de Psicologia UNICESP é uma Instituição de Ensino Superior que atualmente
              pertence ao Grupo Fasul Educacional. Está credenciada pelas Portarias MEC n.º 73, de 14
              de Janeiro de 2019, MEC n.º 499, de 8 de Julho de 2021 e MEC n.º 888, de 27 de Outubro
              de 2020.
            </p>

            <div className="lp-footer-brand__emec">
              <a href="https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/MjE3NTc=" target="_blank" rel="noreferrer">
                <img src="/landing/e-mec-qrcod.webp" alt="e-MEC" loading="lazy" decoding="async" />
              </a>
            </div>
          </section>

          <section className="lp-footer-contact-block">
            <h3>Contato</h3>

            <ul>
              <li>
                <img src="/landing/footer-icon-phone.svg" alt="" aria-hidden="true" />
                <a href={siteConfig.phoneHref}>{siteConfig.phoneLabel}</a>
              </li>
              <li>
                <img src="/landing/footer-icon-mail.svg" alt="" aria-hidden="true" />
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
            </ul>

            <div className="lp-footer-contact-block__reclame-aqui">
              <h3>Reclame Aqui</h3>
              <div className="lp-footer-contact-block__reclame-aqui-badges">
                <a href="https://www.reclameaqui.com.br/empresa/fasulmg-faculdade-sulmineira/" target="_blank" rel="noreferrer">
                  <img
                    src="/landing/verificada-reclame-aqui.webp"
                    alt="Verificada Reclame Aqui"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <a href="https://www.reclameaqui.com.br/empresa/fasulmg-faculdade-sulmineira/" target="_blank" rel="noreferrer">
                  <img
                    src="/landing/otimo-reclame-aqui.webp"
                    alt="Ótimo Reclame Aqui"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>
            </div>
          </section>

          <section className="lp-footer-map-block">
            <h3>Localização</h3>

            <ul>
              <li>
                <img src="/landing/footer-icon-location.svg" alt="" aria-hidden="true" />
                <span>
                  Local: {siteConfig.addressLines[0]}
                  <br />
                  {siteConfig.addressLines[1]}
                </span>
              </li>
            </ul>

            <div className="lp-footer-map-block__card">
              <img
                src="/landing/footer-map.webp"
                alt="Mapa de localização em São Paulo"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <a href={siteConfig.mapsHref} target="_blank" rel="noreferrer">
                <img src="/landing/footer-icon-maps.svg" alt="" aria-hidden="true" />
                Ver no Maps
              </a>
            </div>
          </section>
        </div>

        <div className="lp-footer-bottom__banner">
          {/* Desktop Banner (escondido no mobile) */}
          <img
            src="/landing/banner-rodape-grupo-fasul.webp"
            alt="Grupo Fasul Educacional"
            className="lp-footer-bottom__banner-desktop"
            loading="lazy"
            decoding="async"
          />

          {/* Mobile Banner (escondido no desktop) */}
          <div className="lp-footer-bottom__banner-mobile">
            <img 
              src="/landing/banner-grupo-fasul-mobile.svg" 
              alt="" 
              className="lp-footer-bottom__banner-mobile-bg"
              loading="lazy" 
              decoding="async" 
            />
            <div className="lp-footer-bottom__banner-mobile-content">
              <img 
                src="/landing/logo-grupo-fasul-mobile.svg" 
                alt="Grupo Fasul Educacional" 
                className="lp-footer-bottom__banner-mobile-logo" 
                loading="lazy" 
                decoding="async" 
              />
              
              <div className="lp-footer-bottom__banner-mobile-divider" />
              
              <p className="lp-footer-bottom__banner-mobile-text">
                SOMOS 20 INSTITUIÇÕES EDUCACIONAIS E MAIS DE 400 POLOS NO BRASIL, USA E PORTUGAL!
              </p>

              <div className="lp-footer-bottom__banner-mobile-grid">
                <div className="lp-footer-bottom__banner-mobile-card">
                  <img src="/landing/logo-rodape-fasul-mobile.svg" alt="Fasul" loading="lazy" decoding="async" />
                </div>
                <div className="lp-footer-bottom__banner-mobile-card">
                  <img src="/landing/logo-rodape-unicesp.svg" alt="Unicesp" loading="lazy" decoding="async" />
                </div>
                <div className="lp-footer-bottom__banner-mobile-card">
                  <img src="/landing/logo-rodape-paulista-mobile.svg" alt="Faculdade Paulista" loading="lazy" decoding="async" />
                </div>
                <div className="lp-footer-bottom__banner-mobile-card">
                  <img src="/landing/logo-rodape-psicologia-mobile.svg" alt="Faculdade de Psicologia" loading="lazy" decoding="async" />
                </div>
                <div className="lp-footer-bottom__banner-mobile-card">
                  <img src="/landing/logo-rodape-enfermagem-mobile.svg" alt="Faculdade de Enfermagem" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom__bar">
          <small>© 2026 {siteConfig.name}. Todos os direitos reservados.</small>

          <div className="lp-footer-bottom__links">
            <a href="/politica-de-privacidade">Política de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
    <FaleConoscoSection />
    <a href="https://wa.me/5511947966982?text=Ol%C3%A1,%20estou%20no%20site%20da%20Faculdade%20de%20Psicologia%20e%20quero%20atendimento%20pelo%20WhatsApp." className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Fale conosco pelo WhatsApp">
      <div className="floating-whatsapp__icon">
        <img src="/landing/icone-whatsapp-flutuante.svg" alt="WhatsApp" loading="lazy" decoding="async" style={{ width: '34px', height: '34px', display: 'block' }} />
      </div>
    </a>
    </>
  )
}
