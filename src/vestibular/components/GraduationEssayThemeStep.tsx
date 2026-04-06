import { ArrowLeft } from 'lucide-react'

type Props = {
  onBack: () => void
  onContinue: () => void
  onSelectTheme: (themeId: EssayThemeId) => void
  selectedThemeId: EssayThemeId
}

export type EssayThemeId = 'tema-a' | 'tema-b'

type EssayTheme = {
  id: EssayThemeId
  label: string
  title: string
  paragraphs: string[]
  source?: string
  imageSrc?: string
}

const ESSAY_THEMES: EssayTheme[] = [
  {
    id: 'tema-a',
    label: 'Tema A',
    title: 'Internet - um direito de todos',
    paragraphs: [
      'A ONU acaba de declarar o acesso à rede um direito fundamental do ser humano – assim como saúde, moradia e educação.',
      'No mundo todo, pessoas começam a abrir seus sinais privados de Wi-Fi, organizações e governos se mobilizam para expandir a rede para espaços públicos e regiões onde ela ainda não chega, com acesso livre e gratuito.',
      'Com base no texto apresentado e em seus próprios conhecimentos, escreva uma dissertação, empregando a norma padrão da língua portuguesa, sobre o tema.',
    ],
  },
  {
    id: 'tema-b',
    label: 'Tema B',
    title: 'Inclusão no mercado de trabalho',
    imageSrc: '/vestibular/image-tema-redacao.png',
    source: 'https://download.inep.gov.br. Acesso em: 13 jul. 2021 (adaptado).',
    paragraphs: [
      'Com base no texto apresentado e em seus próprios conhecimentos, escreva uma dissertação, empregando a norma padrão da língua portuguesa, sobre o tema apresentado.',
    ],
  },
]

function renderThemeContent(theme: EssayTheme) {
  return (
    <>
      {theme.imageSrc ? (
        <figure className="vestibular-essay__figure">
          <img
            src={theme.imageSrc}
            alt={`Imagem de apoio do ${theme.label}`}
            width={420}
            height={198}
            loading="lazy"
            decoding="async"
          />
          {theme.source ? <figcaption className="vestibular-essay__source">{theme.source}</figcaption> : null}
        </figure>
      ) : null}

      {theme.paragraphs.map((paragraph) => (
        <p key={paragraph} className="vestibular-essay__paragraph">
          {paragraph}
        </p>
      ))}
    </>
  )
}

export function GraduationEssayThemeStep({
  onBack,
  onContinue,
  onSelectTheme,
  selectedThemeId,
}: Props) {
  const selectedTheme = ESSAY_THEMES.find((theme) => theme.id === selectedThemeId) ?? ESSAY_THEMES[0]

  return (
    <section className="vestibular-essay" aria-labelledby="vestibular-essay-title">
      <div className="vestibular-essay__inner">
        <button type="button" className="vestibular-essay__back" onClick={onBack}>
          <ArrowLeft size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Voltar</span>
        </button>

        <h2 id="vestibular-essay-title" className="vestibular-essay__title">
          <span>Selecione o tema</span>
          <strong>de sua redação</strong>
        </h2>

        <div className="vestibular-essay__themes" role="radiogroup" aria-label="Seleção de tema da redação">
          {ESSAY_THEMES.map((theme) => {
            const isSelected = theme.id === selectedThemeId

            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`vestibular-essay__theme${isSelected ? ' is-selected' : ''}`}
                onClick={() => onSelectTheme(theme.id)}
              >
                <span className={`vestibular-essay__radio${isSelected ? ' is-selected' : ''}`} aria-hidden="true" />
                <span className="vestibular-essay__theme-copy">
                  <strong>{theme.label}</strong>
                  <span>{theme.title}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="vestibular-essay__content">{renderThemeContent(selectedTheme)}</div>

        <div className="vestibular-essay__actions">
          <button type="button" className="vestibular-essay__continue" onClick={onContinue}>
            COMEÇAR SUA REDAÇÃO AGORA
          </button>
        </div>
      </div>
    </section>
  )
}
