import { PSYCHOLOGY_POST_COURSES, formatWorkloadLabelForDisplay } from '@/landing/psychologyPostCourses'
import { getCoursePath, getCourseSlug, toSlug } from '@/lib/courseRoutes'

import type { CatalogCourse, CatalogCourseSummary, CatalogCurriculumVariant, CatalogPriceItem } from '@/lib/catalogApi'

type FallbackPostContent = {
  description: string
  targetAudience: string
  benefits: string
  differentials: string
  laborMarket: string
  featureTitle: string
}

const POST_MONTHLY_PRICE_CENTS = 8600
const POST_TOTAL_PRICE_CENTS = POST_MONTHLY_PRICE_CENTS * 18

const POST_CONTENT_BY_SLUG: Record<string, FallbackPostContent> = {
  neuropsicologia: {
    description:
      'Aprofunde sua atuação na interface entre cognição, comportamento e avaliação clínica, com uma trilha preparada para profissionais que precisam interpretar funções cerebrais, desenvolvimento humano e tomada de decisão terapêutica.',
    targetAudience:
      'Psicólogos e profissionais da saúde que desejam atuar com avaliação neuropsicológica, reabilitação e acompanhamento interdisciplinar.',
    benefits:
      'Estude fundamentos de neurociência aplicada, avaliação cognitiva, construção de raciocínio clínico e elaboração de condutas com olhar técnico.',
    differentials:
      'Conteúdo organizado por trilhas, variações de carga horária e estrutura pensada para integração com prática supervisionada quando disponível.',
    laborMarket:
      'Atuação em clínicas, hospitais, centros de reabilitação, escolas, equipes multiprofissionais e consultoria especializada.',
    featureTitle: 'Neuropsicologia aplicada à prática clínica',
  },
  'psicologia-clinica': {
    description:
      'Estrutura orientada para aprofundar escuta clínica, manejo de casos, planejamento terapêutico e ética profissional em cenários individuais, familiares e institucionais.',
    targetAudience:
      'Psicólogos que desejam fortalecer repertório clínico e ampliar segurança para condução terapêutica em diferentes contextos.',
    benefits:
      'A trilha reúne fundamentos de psicopatologia, técnicas de intervenção, condução de entrevistas e organização do processo terapêutico.',
    differentials:
      'Página e currículo preparados para atualização por API, com apresentação clara de carga horária, investimento e jornada de captação.',
    laborMarket:
      'Consultório próprio, clínicas, hospitais, instituições de acolhimento, escolas e organizações com foco em saúde mental.',
    featureTitle: 'Clínica com base técnica e estrutura escalável',
  },
  'psicologia-escolar-e-educacional': {
    description:
      'Uma pós voltada à compreensão dos processos de aprendizagem, desenvolvimento e mediação institucional dentro do ambiente educacional.',
    targetAudience:
      'Psicólogos, pedagogos e profissionais da educação que atuam com mediação, inclusão, orientação e desenvolvimento escolar.',
    benefits:
      'Explore avaliação institucional, aprendizagem, desenvolvimento infantil, relações escola-família e estratégias de intervenção.',
    differentials:
      'Estrutura pronta para destacar planos pedagógicos, diferenciais acadêmicos e variações de carga horária em páginas individuais.',
    laborMarket:
      'Escolas, redes de ensino, clínicas de apoio educacional, consultoria pedagógica e programas de inclusão.',
    featureTitle: 'Psicologia educacional com foco em intervenção',
  },
  'psicologia-forense-e-juridica': {
    description:
      'Aprofunde temas ligados a perícia, avaliação psicológica, escuta especializada e interface entre psicologia, sistema de justiça e políticas públicas.',
    targetAudience:
      'Psicólogos interessados em atuação pericial, jurídica, socioeducativa e em contextos de mediação de conflitos.',
    benefits:
      'Estude fundamentos legais, técnicas de avaliação, produção de documentos e análise de contextos de vulnerabilidade e violência.',
    differentials:
      'Organização pensada para campanhas segmentadas e para expansão futura com novos módulos e integrações de catálogo.',
    laborMarket:
      'Tribunais, assistência social, varas de família, sistema socioeducativo, consultoria pericial e instituições públicas.',
    featureTitle: 'Psicologia jurídica com jornada própria',
  },
  'psicologia-infantil': {
    description:
      'Curso orientado à compreensão do desenvolvimento infantil, da dinâmica familiar e das intervenções adequadas às diferentes fases da infância.',
    targetAudience:
      'Psicólogos e profissionais interessados em desenvolvimento infantil, acolhimento familiar e acompanhamento terapêutico de crianças.',
    benefits:
      'Aborde desenvolvimento emocional, avaliação de comportamento, construção de vínculo terapêutico e protocolos de acompanhamento.',
    differentials:
      'Apresentação clara de posicionamento, oferta e captação para um nicho com alta procura em clínicas e ambientes escolares.',
    laborMarket:
      'Clínicas, escolas, consultórios, projetos sociais, equipes multiprofissionais e programas de suporte à infância.',
    featureTitle: 'Desenvolvimento infantil e cuidado especializado',
  },
  'psicologia-pastoral': {
    description:
      'Integre escuta psicológica, acolhimento humano e contextos comunitários em uma formação voltada ao cuidado emocional em instituições e comunidades de fé.',
    targetAudience:
      'Psicólogos e profissionais que atuam em contextos pastorais, comunitários e projetos de suporte emocional.',
    benefits:
      'Aprofunde acolhimento, sofrimento psíquico, ética do cuidado, mediação de conflitos e acompanhamento em redes de apoio.',
    differentials:
      'Estrutura flexível para comunicação de nicho, expansão de conteúdo e vinculação com novos materiais vindos da API.',
    laborMarket:
      'Instituições religiosas, projetos sociais, comunidades terapêuticas, atendimento comunitário e consultoria pastoral.',
    featureTitle: 'Escuta, acolhimento e intervenção em comunidade',
  },
  'psicologia-social': {
    description:
      'Aprofunde leitura crítica de território, vínculos coletivos, políticas públicas e intervenção psicossocial em contextos de vulnerabilidade.',
    targetAudience:
      'Psicólogos e profissionais que atuam com rede pública, assistência social, políticas sociais e atendimento comunitário.',
    benefits:
      'Estude território, exclusão social, políticas públicas, construção de vínculo e estratégias de atuação intersetorial.',
    differentials:
      'A estrutura do curso já nasce compatível com páginas, categoria e campanhas voltadas a áreas específicas da psicologia.',
    laborMarket:
      'CRAS, CREAS, projetos sociais, políticas públicas, organizações do terceiro setor e atendimento em rede.',
    featureTitle: 'Intervenção psicossocial orientada por território',
  },
}

function createPriceItem(
  id: number,
  workloadVariantId: number,
  workloadName: string,
  totalHours: number,
): CatalogPriceItem {
  return {
    id,
    amountCents: POST_MONTHLY_PRICE_CENTS,
    installmentsMax: 18,
    workloadVariantId,
    workloadName,
    totalHours,
    modality: 'ead',
    validFrom: '',
  }
}

function createDisciplineName(courseTitle: string, baseName: string) {
  return `${baseName} em ${courseTitle}`
}

function createCurriculumVariant(
  workloadVariantId: number,
  courseTitle: string,
  workloadLabel: string,
): CatalogCurriculumVariant {
  const hoursMatch = workloadLabel.match(/(\d+)/)
  const totalHours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 360
  const disciplineHours = Math.max(20, Math.round(totalHours / 8))

  const disciplines = [
    'Fundamentos Teóricos',
    'Leitura de Casos',
    'Avaliação e Diagnóstico',
    'Intervenções Contemporâneas',
    'Ética e Responsabilidade',
    'Pesquisa Aplicada',
    'Prática Orientada',
    'Seminário Integrador',
  ].map((baseName, index) => ({
    id: workloadVariantId * 100 + index + 1,
    name: createDisciplineName(courseTitle, baseName),
    hours: disciplineHours,
    sequence: index + 1,
  }))

  return {
    id: workloadVariantId,
    name: formatWorkloadLabelForDisplay(workloadLabel),
    totalHours,
    disciplines,
  }
}

function summarizeCourse(course: CatalogCourse): CatalogCourseSummary {
  return {
    institutionId: course.institutionId,
    institutionName: course.institutionName,
    institutionSlug: course.institutionSlug,
    courseType: course.courseType,
    courseId: course.courseId,
    slug: course.slug,
    value: course.value,
    path: course.path,
    title: course.title,
    rawLabel: course.rawLabel,
    image: course.image,
    currentInstallmentPrice: course.currentInstallmentPrice,
    currentInstallmentPriceMonthly: course.currentInstallmentPriceMonthly,
    oldInstallmentPrice: course.oldInstallmentPrice,
    modality: course.modality,
    modalityBadge: course.modalityBadge,
    areaSlug: course.areaSlug,
    primaryAreaLabel: course.primaryAreaLabel,
    fixedInstallments: course.fixedInstallments,
  }
}

const fallbackGraduationCourse: CatalogCourse = {
  institutionId: 0,
  institutionName: siteName(),
  institutionSlug: 'fallback',
  courseType: 'graduacao',
  courseId: 91001,
  code: 'PSI-PRES-FALLBACK',
  slug: 'psicologia',
  value: 'graduacao-psicologia',
  path: '/graduacao/psicologia',
  title: 'Psicologia',
  rawLabel: 'Psicologia Presencial',
  description:
    'A graduação presencial em Psicologia foi posicionada aqui como rota principal da operação, com foco em captação, apresentação clara da oferta e integração futura com os dados oficiais do catálogo.',
  seoDescription:
    'Conheça a graduação presencial em Psicologia, com página própria, formulário de inscrição e fluxo de vestibular preparado para integração.',
  areaLabels: ['Psicologia'],
  primaryAreaLabel: 'Psicologia',
  areaSlug: 'psicologia',
  modality: 'presencial',
  modalityLabel: 'Presencial',
  modalityBadge: 'GRADUAÇÃO PRESENCIAL',
  offeringModalityText: 'Presencial',
  image: '/landing/faculdade-de-psicologia-logo.webp',
  galleryImages: ['/landing/faculdade-de-psicologia-logo.webp'],
  posPriceCents: 0,
  currentInstallmentPrice: 'R$ 549,00/MÊS',
  currentInstallmentPriceMonthly: 'R$ 549,00/MÊS',
  oldInstallmentPrice: 'De R$ 1.890,00',
  pixText: 'Condições comerciais e bolsas são confirmadas no atendimento.',
  fixedInstallments: false,
  teachingPlanUrl: '',
  priceItems: [
    {
      id: 1,
      amountCents: 54900,
      installmentsMax: 60,
      workloadVariantId: 1,
      workloadName: 'Bacharelado Presencial',
      totalHours: 4000,
      modality: 'presencial',
      validFrom: '',
    },
  ],
  workloadOptions: ['4000 Horas'],
  curriculumVariants: [
    {
      id: 1,
      name: 'Matriz curricular principal',
      totalHours: 4000,
      disciplines: [
        { id: 1, name: 'História da Psicologia', hours: 120, sequence: 1 },
        { id: 2, name: 'Psicologia do Desenvolvimento', hours: 120, sequence: 2 },
        { id: 3, name: 'Teorias da Personalidade', hours: 120, sequence: 3 },
        { id: 4, name: 'Psicopatologia', hours: 120, sequence: 4 },
        { id: 5, name: 'Avaliação Psicológica', hours: 120, sequence: 5 },
        { id: 6, name: 'Psicologia Social', hours: 120, sequence: 6 },
        { id: 7, name: 'Ética Profissional', hours: 120, sequence: 7 },
        { id: 8, name: 'Estágio Supervisionado', hours: 120, sequence: 8 },
      ],
    },
  ],
  targetAudience:
    'Candidatos que buscam formação presencial em Psicologia, com base teórica sólida, prática supervisionada e desenvolvimento clínico e institucional progressivo.',
  competenciesBenefits:
    'A página foi estruturada para apresentar proposta de valor, trilha formativa, campos de atuação e pontos de apoio comercial sem depender de uma landing única.',
  competitiveDifferentials:
    'Rota dedicada, vestibular separado, camada de dados pronta para API e possibilidade de incorporar o layout final do Figma sem refazer a arquitetura.',
  durationMonths: 60,
  durationContinuousMonths: 60,
  semesterCount: 10,
  durationText: '10 semestres',
  mecOrdinance: '',
  mecOrdinanceDocumentUrl: '',
  recognition: '',
  recognitionDocumentUrl: '',
  mecScore: null,
  tccRequired: true,
  titulation: 'Bacharelado',
  laborMarket:
    'Clínicas, consultórios, hospitais, escolas, organizações, assistência social, RH, políticas públicas e atuação em contextos comunitários.',
  institutionMecOrdinance: '',
  institutionMecOrdinanceQrCodeImageUrl: '',
  institutionMecOrdinanceQrCodeHref: '',
}

function siteName() {
  return 'Faculdade de Psicologia UNICESP'
}

function buildPostCourse(
  courseIndex: number,
  title: string,
  image: string,
  workloadLabels: string[],
  slug: string,
) {
  const content = POST_CONTENT_BY_SLUG[slug] ?? {
    description: `A pós-graduação em ${title} organiza conteúdo, jornada comercial e página própria para fortalecer a captação e a navegação no catálogo.`,
    targetAudience: `Profissionais que desejam aprofundar atuação em ${title.toLowerCase()}.`,
    benefits: `O curso estrutura fundamentos, aplicação prática e aprofundamento progressivo em ${title.toLowerCase()}.`,
    differentials: 'Página preparada para atualização de API, SEO e formulários dedicados por curso.',
    laborMarket: `Atuação especializada em contextos ligados a ${title.toLowerCase()}.`,
    featureTitle: title,
  }

  const rawLabel = `Pós-graduação em ${title}`
  const value = `pos-${slug}`
  const path = getCoursePath({
    courseType: 'pos',
    courseValue: value,
    courseLabel: rawLabel,
  })
  const workloadVariants = workloadLabels
    .map((item, index) => createCurriculumVariant(courseIndex * 10 + index + 1, title, item))

  const priceItems = workloadVariants.map((variant, index) =>
    createPriceItem(courseIndex * 10 + index + 1, variant.id, variant.name, variant.totalHours),
  )

  return {
    institutionId: 0,
    institutionName: siteName(),
    institutionSlug: 'fallback',
    courseType: 'pos',
    courseId: 92000 + courseIndex,
    code: `POS-${toSlug(title).toUpperCase()}`,
    slug,
    value,
    path,
    title,
    rawLabel,
    description: content.description,
    seoDescription: content.description,
    areaLabels: ['Psicologia'],
    primaryAreaLabel: 'Psicologia',
    areaSlug: 'psicologia',
    modality: 'ead',
    modalityLabel: 'EAD',
    modalityBadge: 'PÓS-GRADUAÇÃO EAD',
    offeringModalityText: 'EAD',
    image: image || '/landing/posgraduacao-banner.webp',
    galleryImages: image ? [image] : [],
    posPriceCents: POST_TOTAL_PRICE_CENTS,
    currentInstallmentPrice: '18X DE R$ 86,00',
    currentInstallmentPriceMonthly: '18X R$ 86,00/MÊS',
    oldInstallmentPrice: '18X R$ 132,00',
    pixText: 'Condição promocional sujeita à disponibilidade comercial.',
    fixedInstallments: false,
    teachingPlanUrl: '',
    priceItems,
    workloadOptions: workloadVariants.map((variant) => `${variant.totalHours} Horas`),
    curriculumVariants: workloadVariants,
    targetAudience: content.targetAudience,
    competenciesBenefits: content.benefits,
    competitiveDifferentials: content.differentials,
    durationMonths: 12,
    durationContinuousMonths: 12,
    semesterCount: 2,
    durationText: '12 meses',
    mecOrdinance: '',
    mecOrdinanceDocumentUrl: '',
    recognition: '',
    recognitionDocumentUrl: '',
    mecScore: null,
    tccRequired: false,
    titulation: 'Especialista',
    laborMarket: content.laborMarket,
    institutionMecOrdinance: '',
    institutionMecOrdinanceQrCodeImageUrl: '',
    institutionMecOrdinanceQrCodeHref: '',
  } satisfies CatalogCourse
}

export const fallbackGraduationCourses: CatalogCourse[] = [fallbackGraduationCourse]

export const fallbackPostCourses: CatalogCourse[] = PSYCHOLOGY_POST_COURSES.map((course, index) =>
  buildPostCourse(
    index + 1,
    course.title,
    course.imageSrc ?? '/landing/posgraduacao-banner.webp',
    course.workloads.map((workload) => workload.label),
    getCourseSlug({
      courseType: 'pos',
      courseValue: course.fallbackValue,
      courseLabel: `Pós-graduação em ${course.title}`,
    }),
  ),
)

export const fallbackGraduationCourseSummaries = fallbackGraduationCourses.map(summarizeCourse)
export const fallbackPostCourseSummaries = fallbackPostCourses.map(summarizeCourse)
