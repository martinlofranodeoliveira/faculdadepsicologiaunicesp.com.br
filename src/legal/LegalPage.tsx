import './legal.css'

import { privacyContent, termsContent, type LegalContent } from './legalContent'

type LegalPageProps = {
  kind: 'privacy' | 'terms'
}

function resolveContent(kind: LegalPageProps['kind']): LegalContent {
  return kind === 'privacy' ? privacyContent : termsContent
}

export function LegalPage({ kind }: LegalPageProps) {
  const content = resolveContent(kind)
  const pageTag = kind === 'privacy' ? 'Privacidade e Protecao de Dados' : 'Condicoes de Navegacao'

  return (
    <main className="legal-page">
      <div className="legal-shell">
        <header className="legal-header">
          <a className="legal-header__brand" href="/">
            <img src="/landing/faculdade-de-psicologia-logo.webp" alt="Faculdade de Psicologia UNICESP" />
          </a>
          <a className="legal-header__back" href="/">
            Voltar para a pagina inicial
          </a>
        </header>

        <section className="legal-hero">
          <p className="legal-hero__tag">{pageTag}</p>
          <h1>{content.pageTitle}</h1>
          <p className="legal-hero__intro">{content.intro}</p>
          <p className="legal-hero__meta">
            {content.lastUpdatedLabel}: <strong>{content.effectiveDate}</strong>
          </p>
        </section>

        <section className="legal-layout">
          <aside className="legal-index" aria-label="Indice das secoes">
            <h2>Indice</h2>
            <ol>
              {content.sections.map((section, index) => (
                <li key={section.title}>
                  <a href={`#secao-${index + 1}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="legal-content">
            {content.sections.map((section, index) => (
              <section key={section.title} id={`secao-${index + 1}`} className="legal-section">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.title}-${paragraphIndex}`}>{paragraph}</p>
                ))}
              </section>
            ))}
          </article>
        </section>
      </div>
    </main>
  )
}
