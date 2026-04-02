# Post-Graduate Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a high-fidelity post-graduate course landing page in the `src/pos` directory based on the Figma design.

**Architecture:** The page will be broken down into reusable React components (using Tailwind CSS and custom CSS where needed) and assembled in an Astro page. It will leverage existing project patterns for lead generation (CourseLeadForm) and layout.

**Tech Stack:** React, Astro, Tailwind CSS, TypeScript.

---

### Task 1: Setup and Assets

**Files:**
- Create: `src/pos/pos.css`
- Create: `src/pos/index.astro`
- Create: `src/pos/PosLandingPage.tsx`

- [ ] **Step 1: Create the `src/pos` directory and basic styles**
  Define base colors and spacing tokens in `src/pos/pos.css` based on Figma (Primary Blue: #1e5ec8, Dark Blue: #001c4b, etc.).

- [ ] **Step 2: Create a skeleton Astro page**
  ```astro
  ---
  import BaseLayout from '@/layouts/BaseLayout.astro'
  import { PosLandingPage } from './PosLandingPage'
  import './pos.css'
  ---
  <BaseLayout title="Pós-Graduação | Faculdade de Psicologia">
    <PosLandingPage client:load />
  </BaseLayout>
  ```

- [ ] **Step 3: Create a skeleton React page component**
  ```tsx
  export function PosLandingPage() {
    return (
      <div className="pos-page">
        {/* Components will go here */}
        <h1>Pós-Graduação Implementation</h1>
      </div>
    )
  }
  ```

- [ ] **Step 4: Commit skeleton**

---

### Task 2: Header Component

**Files:**
- Create: `src/pos/components/PosHeader.tsx`

- [ ] **Step 1: Implement Header based on Figma node `871:2255`**
  Include the three logos (Faculdade de Psicologia, UNICESP, Grupo FASUL) and the "Quero me matricular" CTA.
  
- [ ] **Step 2: Commit Header**

---

### Task 3: Hero & Lead Section

**Files:**
- Create: `src/pos/components/PosHero.tsx`

- [ ] **Step 1: Implement Hero based on Figma node `1044:2`**
  - Breadcrumbs component.
  - Title and description.
  - Benefit cards (Modalidade EAD, 360 a 720 Horas, De 3 a 12 meses).
  - "Ganhe +1" promotional card (`974:108`).
  - Integrate `CourseLeadForm` (import from `@/lead/CourseLeadForm`).

- [ ] **Step 2: Commit Hero**

---

### Task 4: Grade Curricular (Curriculum)

**Files:**
- Create: `src/pos/components/PosCurriculum.tsx`

- [ ] **Step 1: Implement Curriculum section based on Figma node `894:131`**
  - Tabs/Buttons for hour selection (360H, 420H, 720H).
  - Table showing disciplines and hours.
  - Toggle for "Disciplinas (plataforma conted)".

- [ ] **Step 2: Commit Curriculum**

---

### Task 5: Target Audience & Market (Indicado Para)

**Files:**
- Create: `src/pos/components/PosTargetAudience.tsx`

- [x] **Step 1: Implement cards based on Figma node `887:2`**
  - Competências.
  - Público-Alvo.
  - Mercado de Trabalho.
  - "Inscreva-se Já" CTA.

- [x] **Step 2: Commit Target Audience**

---

### Task 6: Testimonials & Related Courses

**Files:**
- Create: `src/pos/components/PosTestimonials.tsx`
- Create: `src/pos/components/PosRelatedCourses.tsx`

- [ ] **Step 1: Implement Testimonials based on node `879:3`**
  - Carousel with student cards, ratings (stars), and quotes.

- [ ] **Step 2: Implement Related Courses based on node `875:686`**
  - Horizontal list of course cards with image, MEC badge, price, and CTA.

- [ ] **Step 3: Commit Testimonials & Related Courses**

---

### Task 7: FAQ & Footer

**Files:**
- Create: `src/pos/components/PosFaq.tsx`
- Create: `src/pos/components/PosFooter.tsx`

- [ ] **Step 1: Implement FAQ based on node `884:2`**
  - Accordion list of questions.
  - WhatsApp CTA banner at the bottom of the section.

- [ ] **Step 2: Implement detailed Footer based on node `884:57`**
  - Brand section with logos and e-MEC link.
  - Contact info.
  - Location map with "Ver no Maps" link.
  - Partner logos at the bottom.

- [ ] **Step 3: Commit FAQ & Footer**

---

### Task 8: Final Assembly and Validation

- [ ] **Step 1: Update `PosLandingPage.tsx` to include all components**
- [ ] **Step 2: Verify responsive design and asset loading**
- [ ] **Step 3: Commit final page**
