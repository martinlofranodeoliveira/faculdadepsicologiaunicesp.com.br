import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type UIEventHandler,
} from 'react'

import { saveCourseLeadDraft } from '@/course/courseLeadDraft'
import { getCoursePath } from '@/lib/courseRoutes'
import { PRIMARY_GRADUATION_JOURNEY_COURSE_ID } from '@/lib/graduation'
import { createJourneyStep1 } from '@/lib/journeyClient'
import {
  readGraduationVestibularLead,
  storeGraduationVestibularLead,
} from '@/vestibular/graduationVestibularState'

import {
  formatPhoneMask,
  normalizeName,
  normalizePhone,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseLeadSelection,
  type CourseType,
} from '../crmLead'
import type { LandingPostCourse, LandingPostCourseWorkload } from '../landingModels'
import { OverlaySelect } from './OverlaySelect'

type FormStep = 1 | 2
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
type StepTransitionPhase = 'idle' | 'exit' | 'enter'
type StepTransitionDirection = 'forward' | 'backward'

type CourseOption = {
  value: string
  label: string
  courseId?: number
  coursePath?: string
  priceLabel?: string
  workloadOptions?: LandingPostCourseWorkload[]
}

type CourseSectionProps = {
  graduationSelection: CourseLeadSelection
  postCourses: LandingPostCourse[]
  onOpenPopup?: (selection: CourseLeadSelection) => void
}

type FieldName = 'courseType' | 'course' | 'workload' | 'fullName' | 'email' | 'phone'
type FieldErrors = Partial<Record<FieldName, string>>
type Touched = Record<FieldName, boolean>

type ResolvedGraduationSelection = {
  courseId?: number
  journeyCourseId: number
  courseLabel: string
  coursePath?: string
}

const COURSE_TYPE_OPTIONS: Array<{ value: CourseType; label: string }> = [
  { value: 'graduacao', label: 'Graduação' },
  { value: 'pos', label: 'Pós-Graduação EAD' },
]

const DEFAULT_GRADUATION_SELECTION: CourseLeadSelection = {
  courseType: 'graduacao',
  courseValue: 'graduacao-psicologia',
  courseLabel: 'Graduação em Psicologia Presencial',
  coursePath: '/graduacao/psicologia',
}

const EMPTY_TOUCHED: Touched = {
  courseType: false,
  course: false,
  workload: false,
  fullName: false,
  email: false,
  phone: false,
}

const COURSE_SCROLL_PAGE_SIZE = 24
const STEP_TRANSITION_DURATION_MS = 240

function normalizeComparableCourseText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function getDefaultWorkloadValue(workloadOptions: LandingPostCourseWorkload[]): string {
  return workloadOptions[0]?.value ?? ''
}

function validateCourseType(value: string): string | undefined {
  if (!value) return 'Selecione para continuar'
  return undefined
}

function validateCourse(value: string): string | undefined {
  if (!value) return 'Informe o curso para continuar'
  return undefined
}

function validateWorkload(value: string, courseType: CourseType | ''): string | undefined {
  if (courseType !== 'pos') return undefined
  if (!value) return 'Selecione a carga horária para continuar'
  return undefined
}

function validateField(field: FieldName, value: string, courseType: CourseType | ''): string | undefined {
  if (field === 'courseType') return validateCourseType(value)
  if (field === 'workload') return validateWorkload(value, courseType)
  if (field === 'fullName') return validateFullName(value)
  if (field === 'email') return validateEmail(value)
  if (field === 'phone') return validatePhone(value)
  return validateCourse(value)
}

function inferCourseTypeFromValue(value: string): CourseType {
  return value.toLowerCase().startsWith('pos-') ? 'pos' : 'graduacao'
}

function buildGraduationOption(selection: CourseLeadSelection): CourseOption {
  return {
    value: selection.courseValue || DEFAULT_GRADUATION_SELECTION.courseValue,
    label: selection.courseLabel || DEFAULT_GRADUATION_SELECTION.courseLabel,
    courseId: selection.courseId,
    coursePath: selection.coursePath || DEFAULT_GRADUATION_SELECTION.coursePath,
    priceLabel: selection.priceLabel,
  }
}

function buildPostCourseOptions(courses: LandingPostCourse[]): CourseOption[] {
  return courses.map((course) => ({
    value: course.selection.courseValue || course.id,
    label: course.selection.courseLabel || course.title,
    courseId: course.selection.courseId,
    coursePath: course.selection.coursePath,
    priceLabel: course.selection.priceLabel,
    workloadOptions: course.workloadOptions,
  }))
}

async function resolveGraduationSelection(
  selection: CourseLeadSelection,
): Promise<ResolvedGraduationSelection> {
  const courseLabel = selection.courseLabel.trim() || DEFAULT_GRADUATION_SELECTION.courseLabel

  if (typeof selection.courseId === 'number' && selection.courseId > 0) {
    return {
      courseId: selection.courseId,
      journeyCourseId: PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
      courseLabel,
      coursePath: selection.coursePath,
    }
  }

  const response = await fetch('/api/graduation-primary-course', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
  const payload = (await response.json().catch(() => null)) as
    | {
        data?: {
          courseId?: number
          journeyCourseId?: number
          courseLabel?: string
          coursePath?: string
        }
        message?: string
      }
    | null

  if (!response.ok) {
    throw new Error(payload?.message || 'Não foi possível localizar o curso principal da graduação.')
  }

  return {
    courseId:
      typeof payload?.data?.courseId === 'number' && payload.data.courseId > 0
        ? payload.data.courseId
        : undefined,
    journeyCourseId:
      typeof payload?.data?.journeyCourseId === 'number' && payload.data.journeyCourseId > 0
        ? payload.data.journeyCourseId
        : PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
    courseLabel: payload?.data?.courseLabel?.trim() || courseLabel,
    coursePath: payload?.data?.coursePath?.trim() || selection.coursePath,
  }
}

export function CourseSection({
  graduationSelection = DEFAULT_GRADUATION_SELECTION,
  postCourses = [],
  onOpenPopup,
}: CourseSectionProps) {
  const graduationOption = useMemo(
    () => buildGraduationOption(graduationSelection),
    [graduationSelection],
  )
  const postCourseOptions = useMemo(() => buildPostCourseOptions(postCourses), [postCourses])

  const [step, setStep] = useState<FormStep>(1)
  const [courseType, setCourseType] = useState<CourseType | ''>('graduacao')
  const [course, setCourse] = useState(graduationOption.value)
  const [courseSearch, setCourseSearch] = useState(graduationOption.label)
  const [workload, setWorkload] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [visibleCourseCount, setVisibleCourseCount] = useState(COURSE_SCROLL_PAGE_SIZE)
  const [stepTransitionPhase, setStepTransitionPhase] = useState<StepTransitionPhase>('idle')
  const [stepTransitionDirection, setStepTransitionDirection] =
    useState<StepTransitionDirection>('forward')
  const [queuedStep, setQueuedStep] = useState<FormStep | null>(null)
  const deferredCourseSearch = useDeferredValue(courseSearch)

  useEffect(() => {
    if (courseType !== 'graduacao') return
    setCourse(graduationOption.value)
    setCourseSearch(graduationOption.label)
  }, [courseType, graduationOption.label, graduationOption.value])

  useEffect(() => {
    if (courseType !== 'pos' || !course) return
    if (postCourseOptions.some((option) => option.value === course)) return

    setCourse('')
    setCourseSearch('')
    setWorkload('')
  }, [course, courseType, postCourseOptions])

  useEffect(() => {
    if (stepTransitionPhase !== 'exit' || queuedStep === null) {
      return
    }

    const timerId = window.setTimeout(() => {
      setStep(queuedStep)
      setStepTransitionPhase('enter')
    }, STEP_TRANSITION_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [queuedStep, stepTransitionPhase])

  useEffect(() => {
    if (stepTransitionPhase !== 'enter') {
      return
    }

    const timerId = window.setTimeout(() => {
      setStepTransitionPhase('idle')
      setQueuedStep(null)
    }, STEP_TRANSITION_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [stepTransitionPhase])

  const courseOptionsByType = useMemo<Record<CourseType, CourseOption[]>>(() => {
    return {
      graduacao: [graduationOption],
      pos: postCourseOptions,
    }
  }, [graduationOption, postCourseOptions])

  const availableCourses = useMemo(() => {
    if (!courseType) return []
    return courseOptionsByType[courseType]
  }, [courseType, courseOptionsByType])

  const filteredCourses = useMemo(() => {
    const normalized = normalizeComparableCourseText(deferredCourseSearch)
    if (!normalized) return availableCourses

    return availableCourses.filter((item) =>
      normalizeComparableCourseText(item.label).includes(normalized),
    )
  }, [availableCourses, deferredCourseSearch])

  useEffect(() => {
    setVisibleCourseCount(COURSE_SCROLL_PAGE_SIZE)
  }, [courseType, deferredCourseSearch])

  const courseOptionsLookup = useMemo(() => {
    const lookup = new Map<string, CourseOption>()

    lookup.set(graduationOption.value, graduationOption)
    postCourseOptions.forEach((option) => {
      lookup.set(option.value, option)
    })

    return lookup
  }, [graduationOption, postCourseOptions])

  const selectedPostCourse = useMemo(() => {
    if (courseType !== 'pos') return undefined
    return courseOptionsLookup.get(course)
  }, [course, courseOptionsLookup, courseType])

  const selectedPostCourseWorkloads = selectedPostCourse?.workloadOptions ?? []

  useEffect(() => {
    if (courseType !== 'pos') {
      setWorkload('')
      return
    }

    setWorkload((current) => {
      if (!selectedPostCourseWorkloads.length) return ''
      if (selectedPostCourseWorkloads.some((item) => item.value === current)) return current
      return getDefaultWorkloadValue(selectedPostCourseWorkloads)
    })
  }, [courseType, selectedPostCourseWorkloads])

  const visibleCourses = useMemo(() => {
    return filteredCourses.slice(0, visibleCourseCount)
  }, [filteredCourses, visibleCourseCount])

  const canLoadMoreVisibleCourses = visibleCourses.length < filteredCourses.length
  const isWorkloadRequired = courseType === 'pos'
  const isWorkloadDisabled = !isWorkloadRequired || !course || !selectedPostCourseWorkloads.length
  const shouldShowWorkloadField = step === 1 && courseType === 'pos'
  const isCourseSearchDisabled = !courseType
  const isGraduationCourseLocked = courseType === 'graduacao'

  const courseTypeInvalid = Boolean(touched.courseType && fieldErrors.courseType)
  const courseInvalid = Boolean(touched.course && fieldErrors.course)
  const workloadInvalid = Boolean(touched.workload && fieldErrors.workload)
  const fullNameInvalid = Boolean(touched.fullName && fieldErrors.fullName)
  const emailInvalid = Boolean(touched.email && fieldErrors.email)
  const phoneInvalid = Boolean(touched.phone && fieldErrors.phone)

  const isStepTransitioning = stepTransitionPhase !== 'idle'
  const formLeadTitle = step === 1 ? 'Encontre seu Curso' : 'Informe os dados'
  const rowTransitionClass =
    stepTransitionPhase === 'idle'
      ? ''
      : `is-${stepTransitionPhase === 'exit' ? 'leaving' : 'entering'} ${
          stepTransitionDirection === 'forward' ? 'to-next' : 'to-prev'
        }`

  const applyFieldValidation = (field: FieldName, value: string) => {
    const error = validateField(field, value, courseType)
    setFieldErrors((previous) => ({ ...previous, [field]: error }))
  }

  const markTouched = (field: FieldName) => {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  const getFieldValue = (field: FieldName): string => {
    if (field === 'courseType') return courseType
    if (field === 'course') return course
    if (field === 'workload') return workload
    if (field === 'fullName') return fullName
    if (field === 'email') return email
    return phone
  }

  const getStepFields = (targetStep: FormStep): FieldName[] => {
    if (targetStep === 1) {
      return ['courseType', 'course', ...(courseType === 'pos' ? (['workload'] as FieldName[]) : [])]
    }

    return ['fullName', 'email', 'phone']
  }

  const validateFields = (fields: FieldName[]): boolean => {
    const nextErrors: FieldErrors = {}

    fields.forEach((field) => {
      nextErrors[field] = validateField(field, getFieldValue(field), courseType)
    })

    setFieldErrors((previous) => ({ ...previous, ...nextErrors }))
    setTouched((previous) => {
      const merged = { ...previous }
      fields.forEach((field) => {
        merged[field] = true
      })
      return merged
    })

    return fields.every((field) => !nextErrors[field])
  }

  const startStepTransition = (targetStep: FormStep) => {
    if (targetStep === step || isStepTransitioning) return

    setStepTransitionDirection(targetStep > step ? 'forward' : 'backward')
    setQueuedStep(targetStep)
    setStepTransitionPhase('exit')
  }

  const handleStepAdvance = (from: FormStep) => {
    if (isStepTransitioning) return

    const isValid = validateFields(getStepFields(from))
    if (!isValid) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    if (from === 1) {
      setIsCourseSearchOpen(false)
    }

    startStepTransition(Math.min(from + 1, 2) as FormStep)
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  const handleStepBack = () => {
    if (isStepTransitioning) return

    startStepTransition(Math.max(step - 1, 1) as FormStep)
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  const validateAllFields = (): FieldErrors => {
    return {
      courseType: validateCourseType(courseType),
      course: validateCourse(course),
      workload: validateWorkload(workload, courseType),
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
  }

  const handleCourseSearchMenuScroll: UIEventHandler<HTMLDivElement> = (event) => {
    if (courseType !== 'pos') return
    if (!canLoadMoreVisibleCourses) return

    const target = event.currentTarget
    const remaining = target.scrollHeight - (target.scrollTop + target.clientHeight)
    if (remaining > 24) return

    setVisibleCourseCount((current) =>
      Math.min(current + COURSE_SCROLL_PAGE_SIZE, filteredCourses.length),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isStepTransitioning) return

    if (step === 1) {
      handleStepAdvance(1)
      return
    }

    const errors = validateAllFields()
    setFieldErrors(errors)
    setTouched({
      courseType: true,
      course: true,
      workload: true,
      fullName: true,
      email: true,
      phone: true,
    })

    const hasErrors = Object.values(errors).some(Boolean)
    if (hasErrors) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    setSubmitStatus('submitting')
    setSubmitMessage('Enviando seus dados...')

    try {
      const selectedCourseOption = courseOptionsLookup.get(course)
      const courseLabel = (selectedCourseOption?.label ?? courseSearch.trim()) || course
      const resolvedCourseType = (courseType || inferCourseTypeFromValue(course)) as CourseType
      const workloadLabel =
        resolvedCourseType === 'pos'
          ? selectedPostCourseWorkloads.find((item) => item.value === workload)?.label
          : undefined
      const nextSelection: CourseLeadSelection = {
        courseType: resolvedCourseType,
        courseValue: course,
        courseLabel,
        courseId: selectedCourseOption?.courseId,
        coursePath: selectedCourseOption?.coursePath,
        priceLabel: selectedCourseOption?.priceLabel,
        workloadValue: resolvedCourseType === 'pos' ? workload : undefined,
        workloadLabel,
      }

      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection: nextSelection,
      })

      if (resolvedCourseType === 'graduacao') {
        const resolvedGraduationSelection = await resolveGraduationSelection(nextSelection)
        const savedLead = readGraduationVestibularLead()
        const canReuseSavedJourney =
          Boolean(savedLead?.journeyId) &&
          ((savedLead?.journeyCourseId ?? savedLead?.courseId) ===
            resolvedGraduationSelection.journeyCourseId ||
            (savedLead?.courseId ?? 0) === (resolvedGraduationSelection.courseId ?? 0)) &&
          savedLead?.fullName.trim().toLowerCase() === fullName.trim().toLowerCase() &&
          savedLead?.email.trim().toLowerCase() === email.trim().toLowerCase() &&
          normalizePhone(savedLead?.phone ?? '') === normalizePhone(phone)

        const journeyId = canReuseSavedJourney
          ? savedLead?.journeyId ?? null
          : (
              await createJourneyStep1({
                course_id: resolvedGraduationSelection.journeyCourseId,
                full_name: fullName.trim(),
                email: email.trim(),
                phone: normalizePhone(phone),
              })
            ).journey_id

        storeGraduationVestibularLead({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: normalizePhone(phone),
          journeyId: journeyId ?? undefined,
          courseId: resolvedGraduationSelection.courseId,
          journeyCourseId: resolvedGraduationSelection.journeyCourseId,
          courseLabel: resolvedGraduationSelection.courseLabel,
          courseValue: nextSelection.courseValue,
          currentStep: 1,
        })

        setSubmitStatus('idle')
        setSubmitMessage('')
        onOpenPopup?.({
          ...nextSelection,
          courseId: resolvedGraduationSelection.courseId,
          courseLabel: resolvedGraduationSelection.courseLabel,
          coursePath: resolvedGraduationSelection.coursePath,
        })
        return
      }

      const targetPath =
        nextSelection.coursePath ||
        getCoursePath({
          courseType: nextSelection.courseType,
          courseValue: nextSelection.courseValue,
          courseLabel: nextSelection.courseLabel,
        })

      saveCourseLeadDraft({
        courseType: nextSelection.courseType,
        courseValue: nextSelection.courseValue,
        courseLabel: nextSelection.courseLabel,
        courseId: nextSelection.courseId,
        workloadValue: nextSelection.workloadValue,
        workloadLabel: nextSelection.workloadLabel,
        openStep: nextSelection.workloadLabel ? 2 : 1,
        leadSubmitted: true,
        fullName: fullName.trim(),
        email: email.trim(),
        phone,
      })

      setSubmitStatus('success')
      setSubmitMessage('Redirecionando...')
      window.location.assign(targetPath)
    } catch (error) {
      console.error('Erro ao enviar lead para o CRM:', error)
      setSubmitStatus('error')
      setSubmitMessage('Não foi possível enviar agora. Tente novamente em instantes.')
    }
  }

  return (
    <section
      id="contato"
      className={`lp-lead ${shouldShowWorkloadField ? 'lp-lead--post-active' : ''}`}
    >
      <div className="lp-lead__inner">
        <div className="lp-lead__title-wrap">
          <h2 className="lp-lead__title">{formLeadTitle}</h2>
          {step === 1 && (
            <img src="/landing/arrow-encontre-seu-curso.svg" alt="" className="lp-lead__title-arrow" aria-hidden="true" />
          )}
        </div>

        <form
          className={`lp-lead__form lp-lead__form--step-${step} ${
            shouldShowWorkloadField ? 'lp-lead__form--step-1-post' : ''
          }`}
          onSubmit={handleSubmit}
          noValidate
        >
          {step === 1 ? (
            <div
              className={`lp-lead__row lp-lead__row--step-1 ${
                shouldShowWorkloadField ? 'is-post' : ''
              } ${rowTransitionClass}`}
            >
              <div className="lp-lead__field-wrap lp-lead__field-wrap--modality">
                <label
                  className={`lp-lead__field lp-lead__field--select ${
                    courseTypeInvalid ? 'is-invalid' : ''
                  }`}
                >
                  <img
                    className="lp-lead__icon lp-lead__icon--chevron"
                    src="/landing/lead-chevron-down.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="lp-lead__select-wrapper">
                    <OverlaySelect
                      value={courseType}
                      options={COURSE_TYPE_OPTIONS}
                      placeholder="Modalidade"
                      ariaLabel="Selecione o tipo de curso"
                      ariaInvalid={courseTypeInvalid}
                      ariaDescribedBy={courseTypeInvalid ? 'lead-course-type-error' : undefined}
                      triggerClassName="ui-select-trigger"
                      contentClassName="lp-lead__select-content"
                      itemClassName="ui-select-item"
                      showChevron={false}
                      onBlur={() => {
                        markTouched('courseType')
                        applyFieldValidation('courseType', courseType)
                      }}
                      onValueChange={(value) => {
                        const nextType = value as CourseType
                        const nextCourseValue =
                          nextType === 'graduacao' ? graduationOption.value : ''
                        const nextCourseLabel =
                          nextType === 'graduacao' ? graduationOption.label : ''

                        setCourseType(nextType)
                        setCourse(nextCourseValue)
                        setCourseSearch(nextCourseLabel)
                        setWorkload('')
                        setIsCourseSearchOpen(false)
                        setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                        setTouched((previous) => ({
                          ...previous,
                          workload: false,
                        }))

                        if (touched.courseType) {
                          const error = validateField('courseType', nextType, nextType)
                          setFieldErrors((previous) => ({ ...previous, courseType: error }))
                        }

                        if (touched.course) {
                          const error = validateField('course', nextCourseValue, nextType)
                          setFieldErrors((previous) => ({ ...previous, course: error }))
                        }
                      }}
                    />
                  </div>
                </label>
                {courseTypeInvalid ? (
                  <span className="lp-lead__error" id="lead-course-type-error">
                    {fieldErrors.courseType}
                  </span>
                ) : null}
              </div>

              <div className="lp-lead__field-wrap lp-lead__course-search-wrap">
                <label
                  className={`lp-lead__field lp-lead__field--search ${
                    courseInvalid ? 'is-invalid' : ''
                  } ${isCourseSearchDisabled ? 'is-disabled' : ''}`}
                >
                  <img
                    className="lp-lead__icon lp-lead__icon--search"
                    src="/landing/lead-search.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Busque o curso"
                    value={courseSearch}
                    disabled={isCourseSearchDisabled}
                    readOnly={isGraduationCourseLocked}
                    autoComplete="off"
                    aria-invalid={courseInvalid}
                    aria-describedby={courseInvalid ? 'lead-course-error' : undefined}
                    aria-readonly={isGraduationCourseLocked}
                    onFocus={() => {
                      if (courseType && !isGraduationCourseLocked) {
                        setIsCourseSearchOpen(true)
                      }
                    }}
                    onBlur={() => {
                      markTouched('course')
                      window.setTimeout(() => {
                        setIsCourseSearchOpen(false)

                        if (isGraduationCourseLocked) {
                          setCourse(graduationOption.value)
                          setCourseSearch(graduationOption.label)
                          setWorkload('')
                          applyFieldValidation('course', graduationOption.value)
                          return
                        }

                        const normalizedSearch = normalizeComparableCourseText(courseSearch)
                        if (!course && normalizedSearch) {
                          const exactMatch = availableCourses.find(
                            (item) => normalizeComparableCourseText(item.label) === normalizedSearch,
                          )
                          if (exactMatch) {
                            setCourse(exactMatch.value)
                            setCourseSearch(exactMatch.label)
                            applyFieldValidation('course', exactMatch.value)
                            return
                          }
                        }

                        applyFieldValidation('course', course)
                      }, 110)
                    }}
                    onChange={(event) => {
                      if (isGraduationCourseLocked) {
                        return
                      }

                      const value = event.target.value
                      setCourseSearch(value)
                      setIsCourseSearchOpen(Boolean(courseType))

                      const normalizedValue = normalizeComparableCourseText(value)
                      const selectedCourseLabel = course ? (courseOptionsLookup.get(course)?.label ?? '') : ''

                      if (!normalizedValue) {
                        if (course) {
                          setCourse('')
                        }
                        setWorkload('')
                        setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                        setTouched((previous) => ({ ...previous, workload: false }))
                        if (touched.course) {
                          applyFieldValidation('course', '')
                        }
                        return
                      }

                      if (
                        course &&
                        selectedCourseLabel &&
                        normalizeComparableCourseText(selectedCourseLabel) !== normalizedValue
                      ) {
                        setCourse('')
                        setWorkload('')
                        setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                        setTouched((previous) => ({ ...previous, workload: false }))
                        if (touched.course) {
                          applyFieldValidation('course', '')
                        }
                      }
                    }}
                  />
                </label>

                {isCourseSearchOpen && courseType && !isGraduationCourseLocked ? (
                  <div
                    className="lp-lead__course-search-menu"
                    role="listbox"
                    aria-label="Cursos disponíveis"
                    onScroll={handleCourseSearchMenuScroll}
                  >
                    {visibleCourses.length > 0 ? (
                      visibleCourses.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`lp-lead__course-search-item ${
                            course === item.value ? 'is-active' : ''
                          }`}
                          onMouseDown={(mouseEvent) => {
                            mouseEvent.preventDefault()
                          }}
                          onClick={() => {
                            setCourse(item.value)
                            setCourseSearch(item.label)
                            setWorkload(getDefaultWorkloadValue(item.workloadOptions ?? []))
                            setIsCourseSearchOpen(false)
                            markTouched('course')
                            setFieldErrors((previous) => ({ ...previous, workload: undefined }))
                            setTouched((previous) => ({ ...previous, workload: false }))
                            applyFieldValidation('course', item.value)
                          }}
                        >
                          {item.label}
                        </button>
                      ))
                    ) : (
                      <span className="lp-lead__course-search-empty">Nenhum curso encontrado.</span>
                    )}

                    {canLoadMoreVisibleCourses ? (
                      <span className="lp-lead__course-search-empty lp-lead__course-search-more">
                        Role para carregar mais cursos...
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {courseInvalid ? (
                  <span className="lp-lead__error" id="lead-course-error">
                    {fieldErrors.course}
                  </span>
                ) : null}
              </div>

              {shouldShowWorkloadField ? (
                <div className="lp-lead__field-wrap lp-lead__field-wrap--workload">
                  <label
                    className={`lp-lead__field lp-lead__field--select ${
                      workloadInvalid ? 'is-invalid' : ''
                    } ${isWorkloadDisabled ? 'is-disabled' : ''}`}
                  >
                    <div className="lp-lead__select-wrapper">
                      <OverlaySelect
                        value={workload}
                        disabled={isWorkloadDisabled}
                        options={selectedPostCourseWorkloads}
                        placeholder="Selecione a carga horária"
                        ariaLabel="Selecione a carga horária"
                        ariaInvalid={workloadInvalid}
                        ariaDescribedBy={workloadInvalid ? 'lead-workload-error' : undefined}
                        triggerClassName="ui-select-trigger"
                        contentClassName="lp-lead__select-content"
                        itemClassName="ui-select-item"
                        onBlur={() => {
                          markTouched('workload')
                          applyFieldValidation('workload', workload)
                        }}
                        onValueChange={(value) => {
                          setWorkload(value)
                          if (touched.workload) {
                            applyFieldValidation('workload', value)
                          }
                        }}
                      />
                    </div>
                  </label>
                  {workloadInvalid ? (
                    <span className="lp-lead__error" id="lead-workload-error">
                      {fieldErrors.workload}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <button type="submit" className="lp-lead__button" disabled={isStepTransitioning}>
                CONTINUAR
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className={`lp-lead__row lp-lead__row--step-2 ${rowTransitionClass}`}>
              <button
                type="button"
                className="lp-lead__back"
                onClick={handleStepBack}
                disabled={isStepTransitioning}
              >
                <img
                  className="lp-lead__back-icon"
                  src="/landing/grade-chevron.svg"
                  alt=""
                  aria-hidden="true"
                />
                Voltar
              </button>

              <div className="lp-lead__field-wrap">
                <label className={`lp-lead__field lp-lead__field--plain ${fullNameInvalid ? 'is-invalid' : ''}`}>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    value={fullName}
                    autoComplete="name"
                    maxLength={120}
                    aria-invalid={fullNameInvalid}
                    aria-describedby={fullNameInvalid ? 'lead-full-name-error' : undefined}
                    onBlur={() => {
                      markTouched('fullName')
                      applyFieldValidation('fullName', fullName)
                    }}
                    onChange={(event) => {
                      const value = normalizeName(event.target.value)
                      setFullName(value)
                      if (touched.fullName) {
                        applyFieldValidation('fullName', value)
                      }
                    }}
                  />
                </label>
                {fullNameInvalid ? (
                  <span className="lp-lead__error" id="lead-full-name-error">
                    {fieldErrors.fullName}
                  </span>
                ) : null}
              </div>

              <div className="lp-lead__field-wrap">
                <label className={`lp-lead__field lp-lead__field--plain ${emailInvalid ? 'is-invalid' : ''}`}>
                  <input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    autoComplete="email"
                    maxLength={120}
                    aria-invalid={emailInvalid}
                    aria-describedby={emailInvalid ? 'lead-email-error' : undefined}
                    onBlur={() => {
                      markTouched('email')
                      applyFieldValidation('email', email)
                    }}
                    onChange={(event) => {
                      const value = event.target.value
                      setEmail(value)
                      if (touched.email) {
                        applyFieldValidation('email', value)
                      }
                    }}
                  />
                </label>
                {emailInvalid ? (
                  <span className="lp-lead__error" id="lead-email-error">
                    {fieldErrors.email}
                  </span>
                ) : null}
              </div>

              <div className="lp-lead__field-wrap">
                <label className={`lp-lead__field lp-lead__field--plain ${phoneInvalid ? 'is-invalid' : ''}`}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Telefone"
                    value={phone}
                    autoComplete="tel-national"
                    maxLength={15}
                    aria-invalid={phoneInvalid}
                    aria-describedby={phoneInvalid ? 'lead-phone-error' : undefined}
                    onBlur={() => {
                      markTouched('phone')
                      applyFieldValidation('phone', phone)
                    }}
                    onChange={(event) => {
                      const masked = formatPhoneMask(event.target.value)
                      setPhone(masked)
                      if (touched.phone) {
                        applyFieldValidation('phone', masked)
                      }
                    }}
                  />
                </label>
                {phoneInvalid ? (
                  <span className="lp-lead__error" id="lead-phone-error">
                    {fieldErrors.phone}
                  </span>
                ) : null}
              </div>

              <button
                type="submit"
                className="lp-lead__button"
                disabled={submitStatus === 'submitting' || isStepTransitioning}
              >
                {submitStatus === 'submitting' ? 'ENVIANDO...' : 'ENVIAR'}
              </button>
            </div>
          ) : null}
        </form>

        {submitMessage ? (
          <small className={`lp-lead__status ${submitStatus === 'error' ? 'lp-lead__status--error' : ''}`}>
            {submitMessage}
          </small>
        ) : null}
      </div>
    </section>
  )
}
