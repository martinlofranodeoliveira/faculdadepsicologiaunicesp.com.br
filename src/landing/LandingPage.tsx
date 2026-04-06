import './landing.css'
import { Suspense, lazy, useCallback, useState } from 'react'

import type { CourseLeadSelection } from './crmLead'
import { CourseSection } from './components/CourseSection'
import { DeferredSection } from './components/DeferredSection'
import { FaqSection } from './components/FaqSection'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { PortariaSection } from './components/PortariaSection'
import type { LandingPostCourse } from './landingModels'

const EnrollmentPopup = lazy(() =>
  import('./components/EnrollmentPopup').then((module) => ({ default: module.EnrollmentPopup })),
)
const FooterSection = lazy(() =>
  import('./components/FooterSection').then((module) => ({ default: module.FooterSection })),
)
const MarketSection = lazy(() =>
  import('./components/MarketSection').then((module) => ({ default: module.MarketSection })),
)
const GradeSection = lazy(() =>
  import('./components/GradeSection').then((module) => ({ default: module.GradeSection })),
)
const HealthCoursesSection = lazy(() =>
  import('./components/HealthCoursesSection').then((module) => ({
    default: module.HealthCoursesSection,
  })),
)
const FaqCtaSection = lazy(() =>
  import('./components/FaqCtaSection').then((module) => ({ default: module.FaqCtaSection })),
)
const FooterBottomSection = lazy(() =>
  import('./components/FooterBottomSection').then((module) => ({
    default: module.FooterBottomSection,
  })),
)

const DEFAULT_HERO_COURSE_SELECTION: CourseLeadSelection = {
  courseType: 'graduacao',
  courseValue: 'graduacao-psicologia',
  courseLabel: 'Graduação em Psicologia Presencial',
  coursePath: '/graduacao/psicologia',
}

type LandingPageProps = {
  heroSelection?: CourseLeadSelection
  postCourses?: LandingPostCourse[]
}

export function LandingPage({
  heroSelection = DEFAULT_HERO_COURSE_SELECTION,
  postCourses = [],
}: LandingPageProps) {
  const [popupSelection, setPopupSelection] = useState<CourseLeadSelection | null>(null)

  const openHeroPopup = useCallback(() => {
    setPopupSelection(heroSelection)
  }, [heroSelection])

  const openCoursePopup = useCallback((selection: CourseLeadSelection) => {
    setPopupSelection(selection)
  }, [])

  const closePopup = useCallback(() => {
    setPopupSelection(null)
  }, [])

  return (
    <main className="lp-page">
      <Header onOpenPopup={openHeroPopup} />
      <HeroSection onOpenPopup={openHeroPopup} />
      <CourseSection graduationSelection={heroSelection} postCourses={postCourses} />
      <PortariaSection />
      <FaqSection onOpenPopup={openHeroPopup} />
      <DeferredSection minHeight={760}>
        <Suspense fallback={null}>
          <FooterSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={780}>
        <Suspense fallback={null}>
          <MarketSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={920}>
        <Suspense fallback={null}>
          <GradeSection onOpenPopup={openHeroPopup} />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={860}>
        <Suspense fallback={null}>
          <HealthCoursesSection courses={postCourses} onOpenCoursePopup={openCoursePopup} />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={760}>
        <Suspense fallback={null}>
          <FaqCtaSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={820}>
        <Suspense fallback={null}>
          <FooterBottomSection />
        </Suspense>
      </DeferredSection>
      {popupSelection ? (
        <Suspense fallback={null}>
          <EnrollmentPopup
            key={`${popupSelection.courseValue}-${popupSelection.courseId ?? 0}`}
            isOpen
            selection={popupSelection}
            onClose={closePopup}
          />
        </Suspense>
      ) : null}
    </main>
  )
}
