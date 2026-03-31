export const siteConfig = {
  name: 'Faculdade de Psicologia UNICESP',
  shortName: 'Psicologia UNICESP',
  description:
    'Graduação presencial em Psicologia e pós-graduações em Psicologia com estrutura acadêmica preparada para captação, SEO e integração com API.',
  domain: 'faculdadepsicologiaunicesp.com.br',
  siteUrl: 'https://faculdadepsicologiaunicesp.com.br',
  email: 'contato@faculdadepsicologiaunicesp.com.br',
  phoneLabel: '(35) 9806-0604',
  phoneHref: 'tel:+553598060604',
  whatsappHref: 'https://wa.me/553598060604',
  addressLines: [
    'Rua Dr. Diogo de Faria, 66 - Vila Mariana',
    'São Paulo - SP, CEP: 04037-000',
  ],
  mapsHref:
    'https://maps.google.com/?q=Rua+Dr.+Diogo+de+Faria,+66+-+Vila+Mariana,+S%C3%A3o+Paulo+-+SP,+04037-000',
  primaryGraduationSlug: 'psicologia',
} as const

export const siteNavigation = [
  { label: 'Início', href: '/' },
  { label: 'Graduação', href: '/graduacao/psicologia' },
  { label: 'Pós-graduação', href: '/pos-graduacao' },
  { label: 'Vestibular', href: '/graduacao/vestibular' },
  { label: 'Contato', href: '#contato' },
] as const

export const siteHeroHighlights = [
  'Estrutura preparada para captação por SEO, mídia paga e formulários de alta intenção.',
  'Página de graduação dedicada ao curso presencial de Psicologia, sem categoria redundante.',
  'Categoria de pós e páginas de curso com dados vindos da API quando o catálogo estiver disponível.',
] as const

export const siteValueProps = [
  {
    eyebrow: 'Graduação',
    title: 'Um curso presencial com jornada própria',
    description:
      'A graduação entra como uma experiência dedicada, com rota direta, funil de inscrição e vestibular desacoplados da categoria.',
  },
  {
    eyebrow: 'Pós-graduação',
    title: 'Catálogo expansível por categoria',
    description:
      'As páginas de pós já nascem com estrutura para receber novos cursos sem refazer layout, SEO ou integração.',
  },
  {
    eyebrow: 'Operação',
    title: 'Base pronta para API e CRM',
    description:
      'A camada de dados respeita IDs e ambiente próprios, com fallback local para não travar desenvolvimento nem build.',
  },
] as const

export const siteFaqItems = [
  {
    question: 'O site já está preparado para consumir o catálogo da API?',
    answer:
      'Sim. As páginas usam uma camada de catálogo com normalização e fallback. Quando a API pública estiver configurada, o site passa a consumir os dados automaticamente.',
  },
  {
    question: 'A graduação precisa de uma categoria própria?',
    answer:
      'Não nesta fase. A navegação já aponta diretamente para a página do curso presencial principal, mantendo a jornada mais curta.',
  },
  {
    question: 'Os formulários já respeitam a lógica de CRM existente?',
    answer:
      'Sim. O envio reutiliza as variáveis de ambiente do CRM e já aceita `courseId` dinâmico quando o catálogo real estiver ativo.',
  },
] as const

export const footerGroupLogos = [
  {
    src: '/landing/logo-rodape-fasul.webp',
    alt: 'FASUL Educacional',
  },
  {
    src: '/landing/logo-rodape-unicesp.webp',
    alt: 'UNICESP',
  },
  {
    src: '/landing/faculdade-de-psicologia-logo-rodape.webp',
    alt: 'Faculdade de Psicologia',
  },
] as const
