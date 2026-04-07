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
      'Aprofunde sua atuaÃ§Ã£o na interface entre cogniÃ§Ã£o, comportamento e avaliaÃ§Ã£o clÃ­nica, com uma trilha preparada para profissionais que precisam interpretar funÃ§Ãµes cerebrais, desenvolvimento humano e tomada de decisÃ£o terapÃªutica.',
    targetAudience:
      'PsicÃ³logos e profissionais da saÃºde que desejam atuar com avaliaÃ§Ã£o neuropsicolÃ³gica, reabilitaÃ§Ã£o e acompanhamento interdisciplinar.',
    benefits:
      'Estude fundamentos de neurociÃªncia aplicada, avaliaÃ§Ã£o cognitiva, construÃ§Ã£o de raciocÃ­nio clÃ­nico e elaboraÃ§Ã£o de condutas com olhar tÃ©cnico.',
    differentials:
      'ConteÃºdo organizado por trilhas, variaÃ§Ãµes de carga horÃ¡ria e estrutura pensada para integraÃ§Ã£o com prÃ¡tica supervisionada quando disponÃ­vel.',
    laborMarket:
      'AtuaÃ§Ã£o em clÃ­nicas, hospitais, centros de reabilitaÃ§Ã£o, escolas, equipes multiprofissionais e consultoria especializada.',
    featureTitle: 'Neuropsicologia aplicada Ã  prÃ¡tica clÃ­nica',
  },
  'psicologia-clinica': {
    description:
      'Estrutura orientada para aprofundar escuta clÃ­nica, manejo de casos, planejamento terapÃªutico e Ã©tica profissional em cenÃ¡rios individuais, familiares e institucionais.',
    targetAudience:
      'PsicÃ³logos que desejam fortalecer repertÃ³rio clÃ­nico e ampliar seguranÃ§a para conduÃ§Ã£o terapÃªutica em diferentes contextos.',
    benefits:
      'A trilha reÃºne fundamentos de psicopatologia, tÃ©cnicas de intervenÃ§Ã£o, conduÃ§Ã£o de entrevistas e organizaÃ§Ã£o do processo terapÃªutico.',
    differentials:
      'PÃ¡gina e currÃ­culo preparados para atualizaÃ§Ã£o por API, com apresentaÃ§Ã£o clara de carga horÃ¡ria, investimento e jornada de captaÃ§Ã£o.',
    laborMarket:
      'ConsultÃ³rio prÃ³prio, clÃ­nicas, hospitais, instituiÃ§Ãµes de acolhimento, escolas e organizaÃ§Ãµes com foco em saÃºde mental.',
    featureTitle: 'ClÃ­nica com base tÃ©cnica e estrutura escalÃ¡vel',
  },
  'psicologia-escolar-e-educacional': {
    description:
      'Uma pÃ³s voltada Ã  compreensÃ£o dos processos de aprendizagem, desenvolvimento e mediaÃ§Ã£o institucional dentro do ambiente educacional.',
    targetAudience:
      'PsicÃ³logos, pedagogos e profissionais da educaÃ§Ã£o que atuam com mediaÃ§Ã£o, inclusÃ£o, orientaÃ§Ã£o e desenvolvimento escolar.',
    benefits:
      'Explore avaliaÃ§Ã£o institucional, aprendizagem, desenvolvimento infantil, relaÃ§Ãµes escola-famÃ­lia e estratÃ©gias de intervenÃ§Ã£o.',
    differentials:
      'Estrutura pronta para destacar planos pedagÃ³gicos, diferenciais acadÃªmicos e variaÃ§Ãµes de carga horÃ¡ria em pÃ¡ginas individuais.',
    laborMarket:
      'Escolas, redes de ensino, clÃ­nicas de apoio educacional, consultoria pedagÃ³gica e programas de inclusÃ£o.',
    featureTitle: 'Psicologia educacional com foco em intervenÃ§Ã£o',
  },
  'psicologia-forense-e-juridica': {
    description:
      'Aprofunde temas ligados a perÃ­cia, avaliaÃ§Ã£o psicolÃ³gica, escuta especializada e interface entre psicologia, sistema de justiÃ§a e polÃ­ticas pÃºblicas.',
    targetAudience:
      'PsicÃ³logos interessados em atuaÃ§Ã£o pericial, jurÃ­dica, socioeducativa e em contextos de mediaÃ§Ã£o de conflitos.',
    benefits:
      'Estude fundamentos legais, tÃ©cnicas de avaliaÃ§Ã£o, produÃ§Ã£o de documentos e anÃ¡lise de contextos de vulnerabilidade e violÃªncia.',
    differentials:
      'OrganizaÃ§Ã£o pensada para campanhas segmentadas e para expansÃ£o futura com novos mÃ³dulos e integraÃ§Ãµes de catÃ¡logo.',
    laborMarket:
      'Tribunais, assistÃªncia social, varas de famÃ­lia, sistema socioeducativo, consultoria pericial e instituiÃ§Ãµes pÃºblicas.',
    featureTitle: 'Psicologia jurÃ­dica com jornada prÃ³pria',
  },
  'psicologia-infantil': {
    description:
      'Curso orientado Ã  compreensÃ£o do desenvolvimento infantil, da dinÃ¢mica familiar e das intervenÃ§Ãµes adequadas Ã s diferentes fases da infÃ¢ncia.',
    targetAudience:
      'PsicÃ³logos e profissionais interessados em desenvolvimento infantil, acolhimento familiar e acompanhamento terapÃªutico de crianÃ§as.',
    benefits:
      'Aborde desenvolvimento emocional, avaliaÃ§Ã£o de comportamento, construÃ§Ã£o de vÃ­nculo terapÃªutico e protocolos de acompanhamento.',
    differentials:
      'ApresentaÃ§Ã£o clara de posicionamento, oferta e captaÃ§Ã£o para um nicho com alta procura em clÃ­nicas e ambientes escolares.',
    laborMarket:
      'ClÃ­nicas, escolas, consultÃ³rios, projetos sociais, equipes multiprofissionais e programas de suporte Ã  infÃ¢ncia.',
    featureTitle: 'Desenvolvimento infantil e cuidado especializado',
  },
  'psicologia-pastoral': {
    description:
      'Integre escuta psicolÃ³gica, acolhimento humano e contextos comunitÃ¡rios em uma formaÃ§Ã£o voltada ao cuidado emocional em instituiÃ§Ãµes e comunidades de fÃ©.',
    targetAudience:
      'PsicÃ³logos e profissionais que atuam em contextos pastorais, comunitÃ¡rios e projetos de suporte emocional.',
    benefits:
      'Aprofunde acolhimento, sofrimento psÃ­quico, Ã©tica do cuidado, mediaÃ§Ã£o de conflitos e acompanhamento em redes de apoio.',
    differentials:
      'Estrutura flexÃ­vel para comunicaÃ§Ã£o de nicho, expansÃ£o de conteÃºdo e vinculaÃ§Ã£o com novos materiais vindos da API.',
    laborMarket:
      'InstituiÃ§Ãµes religiosas, projetos sociais, comunidades terapÃªuticas, atendimento comunitÃ¡rio e consultoria pastoral.',
    featureTitle: 'Escuta, acolhimento e intervenÃ§Ã£o em comunidade',
  },
  'psicologia-social': {
    description:
      'Aprofunde leitura crÃ­tica de territÃ³rio, vÃ­nculos coletivos, polÃ­ticas pÃºblicas e intervenÃ§Ã£o psicossocial em contextos de vulnerabilidade.',
    targetAudience:
      'PsicÃ³logos e profissionais que atuam com rede pÃºblica, assistÃªncia social, polÃ­ticas sociais e atendimento comunitÃ¡rio.',
    benefits:
      'Estude territÃ³rio, exclusÃ£o social, polÃ­ticas pÃºblicas, construÃ§Ã£o de vÃ­nculo e estratÃ©gias de atuaÃ§Ã£o intersetorial.',
    differentials:
      'A estrutura do curso jÃ¡ nasce compatÃ­vel com pÃ¡ginas, categoria e campanhas voltadas a Ã¡reas especÃ­ficas da psicologia.',
    laborMarket:
      'CRAS, CREAS, projetos sociais, polÃ­ticas pÃºblicas, organizaÃ§Ãµes do terceiro setor e atendimento em rede.',
    featureTitle: 'IntervenÃ§Ã£o psicossocial orientada por territÃ³rio',
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
    'Fundamentos TeÃ³ricos',
    'Leitura de Casos',
    'AvaliaÃ§Ã£o e DiagnÃ³stico',
    'IntervenÃ§Ãµes ContemporÃ¢neas',
    'Ã‰tica e Responsabilidade',
    'Pesquisa Aplicada',
    'PrÃ¡tica Orientada',
    'SeminÃ¡rio Integrador',
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
    'A graduaÃ§Ã£o presencial em Psicologia foi posicionada aqui como rota principal da operaÃ§Ã£o, com foco em captaÃ§Ã£o, apresentaÃ§Ã£o clara da oferta e integraÃ§Ã£o futura com os dados oficiais do catÃ¡logo.',
  seoDescription:
    'ConheÃ§a a graduaÃ§Ã£o presencial em Psicologia, com pÃ¡gina prÃ³pria, formulÃ¡rio de inscriÃ§Ã£o e fluxo de vestibular preparado para integraÃ§Ã£o.',
  areaLabels: ['Psicologia'],
  primaryAreaLabel: 'Psicologia',
  areaSlug: 'psicologia',
  modality: 'presencial',
  modalityLabel: 'Presencial',
  modalityBadge: 'GRADUAÃ‡ÃƒO PRESENCIAL',
  offeringModalityText: 'Presencial',
  image: '/landing/faculdade-de-psicologia-logo.webp',
  galleryImages: ['/landing/faculdade-de-psicologia-logo.webp'],
  posPriceCents: 0,
  currentInstallmentPrice: 'R$ 549,00/MÃŠS',
  currentInstallmentPriceMonthly: 'R$ 549,00/MÃŠS',
  oldInstallmentPrice: 'De R$ 1.890,00',
  pixText: 'CondiÃ§Ãµes comerciais e bolsas sÃ£o confirmadas no atendimento.',
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
        { id: 1, name: 'HistÃ³ria da Psicologia', hours: 120, sequence: 1 },
        { id: 2, name: 'Psicologia do Desenvolvimento', hours: 120, sequence: 2 },
        { id: 3, name: 'Teorias da Personalidade', hours: 120, sequence: 3 },
        { id: 4, name: 'Psicopatologia', hours: 120, sequence: 4 },
        { id: 5, name: 'AvaliaÃ§Ã£o PsicolÃ³gica', hours: 120, sequence: 5 },
        { id: 6, name: 'Psicologia Social', hours: 120, sequence: 6 },
        { id: 7, name: 'Ã‰tica Profissional', hours: 120, sequence: 7 },
        { id: 8, name: 'EstÃ¡gio Supervisionado', hours: 120, sequence: 8 },
      ],
    },
  ],
  targetAudience:
    'Candidatos que buscam formaÃ§Ã£o presencial em Psicologia, com base teÃ³rica sÃ³lida, prÃ¡tica supervisionada e desenvolvimento clÃ­nico e institucional progressivo.',
  competenciesBenefits:
    'A pÃ¡gina foi estruturada para apresentar proposta de valor, trilha formativa, campos de atuaÃ§Ã£o e pontos de apoio comercial sem depender de uma landing Ãºnica.',
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
    'ClÃ­nicas, consultÃ³rios, hospitais, escolas, organizaÃ§Ãµes, assistÃªncia social, RH, polÃ­ticas pÃºblicas e atuaÃ§Ã£o em contextos comunitÃ¡rios.',
  regulatoryBodyId: null,
  regulatoryBodyName: '',
  regulatoryBodyComplement: '',
  salaryAverage: null,
  salaryJunior: null,
  salaryPleno: null,
  salarySenior: null,
  salaryWithoutPos: null,
  salaryWithPos: null,
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
    description: `A pÃ³s-graduaÃ§Ã£o em ${title} organiza conteÃºdo, jornada comercial e pÃ¡gina prÃ³pria para fortalecer a captaÃ§Ã£o e a navegaÃ§Ã£o no catÃ¡logo.`,
    targetAudience: `Profissionais que desejam aprofundar atuaÃ§Ã£o em ${title.toLowerCase()}.`,
    benefits: `O curso estrutura fundamentos, aplicaÃ§Ã£o prÃ¡tica e aprofundamento progressivo em ${title.toLowerCase()}.`,
    differentials: 'PÃ¡gina preparada para atualizaÃ§Ã£o de API, SEO e formulÃ¡rios dedicados por curso.',
    laborMarket: `AtuaÃ§Ã£o especializada em contextos ligados a ${title.toLowerCase()}.`,
    featureTitle: title,
  }

  const rawLabel = `PÃ³s-graduaÃ§Ã£o em ${title}`
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
    modalityBadge: 'PÃ“S-GRADUAÃ‡ÃƒO EAD',
    offeringModalityText: 'EAD',
    image: image || '/landing/posgraduacao-banner.webp',
    galleryImages: image ? [image] : [],
    posPriceCents: POST_TOTAL_PRICE_CENTS,
    currentInstallmentPrice: '18X DE R$ 86,00',
    currentInstallmentPriceMonthly: '18X R$ 86,00/MÃŠS',
    oldInstallmentPrice: '18X R$ 329,00/MÊS',
    pixText: 'CondiÃ§Ã£o promocional sujeita Ã  disponibilidade comercial.',
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
    regulatoryBodyId: null,
    regulatoryBodyName: '',
    regulatoryBodyComplement: '',
    salaryAverage: null,
    salaryJunior: null,
    salaryPleno: null,
    salarySenior: null,
    salaryWithoutPos: null,
    salaryWithPos: null,
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
      courseLabel: `PÃ³s-graduaÃ§Ã£o em ${course.title}`,
    }),
  ),
)

export const fallbackGraduationCourseSummaries = fallbackGraduationCourses.map(summarizeCourse)
export const fallbackPostCourseSummaries = fallbackPostCourses.map(summarizeCourse)
