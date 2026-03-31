# Checkpoint: Astro Migration Base

Date: 2026-03-31

## What this checkpoint represents

This repository is no longer just the old landing page build.
It has been migrated to an Astro + React site structure and is now in an intermediate state:

- the architectural migration is in place;
- the site already runs with Astro as the main app runtime;
- visual refinements are still pending and will be handled in a later phase by another developer.

This checkpoint exists so the team has a clear rollback point before the next round of visual changes.

## Current technical state

The project now uses Astro as the main entry/build tool:

- `npm run dev` -> `astro dev`
- `npm run build` -> `astro check && astro build`
- `npm run preview` -> `astro preview`
- `npm run start` -> Node server output from Astro

The previous Vite flow was not deleted completely and remains available only as transitional support/reference:

- `npm run dev:vite`
- `npm run build:vite`

## Main folders after migration

- `src/pages`: Astro routes for the site
- `src/layouts`: Astro layouts
- `src/home`: home page structure/data
- `src/course`: post-graduation category, course pages and explorer flow
- `src/lead`: reusable lead capture flows/forms
- `src/vestibular`: graduation/vestibular flow
- `src/lib`: catalog, CRM, journey and sitemap integrations
- `src/site`: global site configuration and fallback data
- `src/legal`: legal pages/content

## Important transition note

Legacy code from the previous implementation still exists in the repository, especially folders/files related to the old landing implementation.
That code should not be removed blindly during the visual refinement phase.
Until full visual parity is confirmed, those legacy files still serve as migration reference.

In practice:

- Astro is now the active platform.
- The project is already organized as a site, not just a single landing page.
- Some visual details are intentionally still pending.
- The next developer should treat this commit as the stable baseline before making layout/UI refinements.

## Recommended use of this checkpoint

If any future change breaks layout, routes, forms or rendering consistency, use this checkpoint commit/tag as the comparison base.
This is the safest known version after the structural migration and before the next visual iteration.

## Operational intent

This checkpoint should be preserved in Git history as the migration baseline.
If needed later, compare future changes against the checkpoint tag/commit created together with this file.
