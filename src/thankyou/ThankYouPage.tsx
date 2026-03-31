import { useMemo } from 'react'

import { readGraduationThankYouLead } from './graduationThankYouState'
import { readPostThankYouLead } from './postThankYouState'

type Props = {
  variant: 'general' | 'graduation' | 'post'
}

function getVariantCopy(variant: Props['variant']) {
  if (variant === 'graduation') {
    return {
      title: 'Inscrição recebida',
      description:
        'Sua inscrição de graduação foi registrada. Nossa equipe continuará o atendimento com base nas informações já enviadas.',
      primaryHref: '/graduacao/psicologia',
      primaryLabel: 'Voltar para a graduação',
      secondaryHref: '/graduacao/vestibular',
      secondaryLabel: 'Reabrir vestibular',
    }
  }

  if (variant === 'post') {
    return {
      title: 'Cadastro concluído',
      description:
        'Seu interesse em pós-graduação foi registrado. A equipe acadêmica poderá seguir com atendimento e oferta a partir deste cadastro.',
      primaryHref: '/pos-graduacao',
      primaryLabel: 'Ver outros cursos de pós',
      secondaryHref: '/',
      secondaryLabel: 'Voltar para a home',
    }
  }

  return {
    title: 'Obrigado',
    description: 'Recebemos suas informações. Nosso time entrará em contato em breve.',
    primaryHref: '/',
    primaryLabel: 'Voltar para a home',
    secondaryHref: '/pos-graduacao',
    secondaryLabel: 'Explorar cursos',
  }
}

export function ThankYouPage({ variant }: Props) {
  const copy = getVariantCopy(variant)

  const lead = useMemo(() => {
    if (variant === 'graduation') return readGraduationThankYouLead()
    if (variant === 'post') return readPostThankYouLead()
    return null
  }, [variant])

  const personalizedGreeting = lead?.fullName
    ? `${lead.fullName.split(/\s+/)[0]}, ${copy.description}`
    : copy.description

  return (
    <main className="thankyou-page">
      <div className="container--narrow">
        <section className="thankyou-card surface-card" aria-label={copy.title}>
          <img
            className="thankyou-card__logo"
            src="/landing/faculdade-de-psicologia-logo.webp"
            alt="Faculdade de Psicologia UNICESP"
          />

          <p className="eyebrow">Confirmação</p>
          <h1>{copy.title}</h1>
          <p>{personalizedGreeting}</p>

          <div className="thankyou-card__actions">
            <a className="button-primary" href={copy.primaryHref}>
              {copy.primaryLabel}
            </a>
            <a className="button-ghost" href={copy.secondaryHref}>
              {copy.secondaryLabel}
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
