 import { siteConfig } from '@/site/config'

export function FaleConoscoSection() {
  return (
    <section className="lp-fale-conosco">
      <div className="lp-fale-conosco__bg">
        <picture>
          <source srcSet="/landing/background-fale-conosco-mobile.webp" media="(max-width: 768px)" />
          <img src="/landing/background-fale-conosco.webp" alt="Fundo" loading="lazy" decoding="async" />
        </picture>
      </div>

      <div className="lp-fale-conosco__inner">
        <div className="lp-fale-conosco__header-col">
          <h2 className="lp-fale-conosco__title">FALE CONOSCO</h2>
          <p className="lp-fale-conosco__subtitle">QUAL CANAL GOSTARIA DE FALAR?</p>
        </div>

        <div className="lp-fale-conosco__cards">
          
          {/* Card Ligação */}
          <div className="lp-fale-conosco__card">
            <div className="lp-fale-conosco__card-header">
              <div className="lp-fale-conosco__badge">
                <img src="/landing/icone-ligacao.webp" alt="Ligação" loading="lazy" decoding="async" />
              </div>
            </div>

            <div className="lp-fale-conosco__card-body">
              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content">
                  <h4>1. FAÇA SUA MATRÍCULA AGORA</h4>
                  <p>Tire suas dúvidas sobre Cursos de Graduação e Pós-graduação e <strong className="text-blue">Realize seu Sonho com a Fasul.</strong></p>
                  <a href={siteConfig.phoneHref} className="lp-fale-conosco__item-action">
                    <img src="/landing/icone-phone-green.webp" alt="Telefone" />
                    <span>{siteConfig.phoneLabel}</span>
                  </a>
                </div>
              </div>

              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content">
                  <h4>2. CONVERSE CONOSCO</h4>
                  <p>Estamos prontos para tirar suas dúvidas e te dar o Suporte certo para qualquer necessidade sua.</p>
                  <a href={siteConfig.phoneHref} className="lp-fale-conosco__item-action">
                    <img src="/landing/icone-phone-green.webp" alt="Telefone" />
                    <span>{siteConfig.phoneLabel}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card WhatsApp */}
          <div className="lp-fale-conosco__card">
            <div className="lp-fale-conosco__card-header">
              <div className="lp-fale-conosco__badge">
                <img src="/landing/icone-whatsapp.webp" alt="WhatsApp" loading="lazy" decoding="async" />
              </div>
            </div>

            <div className="lp-fale-conosco__card-body">
              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content lp-fale-conosco__item-content--row">
                  <div className="lp-fale-conosco__item-text">
                    <h4>3. ATENDIMENTO SECRETARIA</h4>
                    <p>Pendências de Documentos, Histórico, Declarações e Requerimentos.</p>
                  </div>
                  <a href={siteConfig.whatsappHref} className="lp-fale-conosco__btn-whatsapp" target="_blank" rel="noreferrer">
                    <img src="/landing/icone-box-whatsapp.webp" alt="WhatsApp" />
                  </a>
                </div>
              </div>

              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content lp-fale-conosco__item-content--row">
                  <div className="lp-fale-conosco__item-text">
                    <h4>4. TUTORIA (APOIO AO ALUNO)</h4>
                    <p>Dúvidas sobre o Conteúdo das Aulas e Suporte para seu Sucesso Acadêmico.</p>
                  </div>
                  <a href={siteConfig.whatsappHref} className="lp-fale-conosco__btn-whatsapp" target="_blank" rel="noreferrer">
                    <img src="/landing/icone-box-whatsapp.webp" alt="WhatsApp" />
                  </a>
                </div>
              </div>

              <div className="lp-fale-conosco__item">
                <div className="lp-fale-conosco__item-line"></div>
                <div className="lp-fale-conosco__item-content lp-fale-conosco__item-content--row">
                  <div className="lp-fale-conosco__item-text">
                    <h4>5. FINANCEIRO E ACORDO FÁCIL</h4>
                    <p>Pague sem dor de cabeça! 2ª via de Boletos, Mensalidades, Negociação.</p>
                  </div>
                  <a href={siteConfig.whatsappHref} className="lp-fale-conosco__btn-whatsapp" target="_blank" rel="noreferrer">
                    <img src="/landing/icone-box-whatsapp.webp" alt="WhatsApp" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}