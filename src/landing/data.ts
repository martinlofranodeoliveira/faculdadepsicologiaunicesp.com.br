export type NavItem = {
  id: string
  label: string
}

export type CourseCard = {
  name: string
  modality: 'EAD' | 'Presencial' | 'Semipresencial'
  duration: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type FormCourseOption = {
  value: string
  label: string
}

export type FormCourseGroup = {
  label: string
  options: FormCourseOption[]
}

export const navItems: NavItem[] = [
  { id: 'inicio', label: 'Início' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contato', label: 'Contato' },
]

export const featuredCourses: CourseCard[] = [
  { name: 'Bacharelado em Psicologia', modality: 'Presencial', duration: '10 semestres' },
  { name: 'Pós em Psicologia Hospitalar', modality: 'EAD', duration: '12 meses' },
  { name: 'Pós em Neuropsicologia Clínica', modality: 'EAD', duration: '12 meses' },
]

export const formCourseGroups: FormCourseGroup[] = [
  {
    label: 'Graduação',
    options: [{ value: 'graduacao-psicologia', label: 'Graduação em Psicologia Presencial' }],
  },
]

export const faqItems: FaqItem[] = [
  {
    question: 'Quando abre o próximo processo seletivo?',
    answer:
      'A estrutura está pronta para inserir a agenda real. Enquanto isso, este bloco funciona como placeholder de conteúdo.',
  },
  {
    question: 'Posso estudar em modalidade EAD?',
    answer:
      'Sim. A base já prevê blocos para cursos presenciais, semipresenciais e EAD. Você poderá substituir os dados finais quando quiser.',
  },
  {
    question: 'Como envio meus dados para contato?',
    answer:
      'O formulário final será integrado ao CRM usando as variáveis de ambiente já preparadas neste projeto.',
  },
]
