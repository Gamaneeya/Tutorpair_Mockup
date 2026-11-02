# TutorPair — Latest Figma Design as a Ready-to-Run Website

**Source:** `TutoPair-MockUp-Prototype.zip` provided by the project team. This is a **static deployment of the actual Figma Make interface**, not a redesign or a replacement with the older V7.8 design. Original Figma Make uses a React/Vite wrapper for the homepage, while the interactive pages already use plain browser-native HTML/CSS/ES modules under `public/`. This package puts those pages in `frontend/` and replaces only that wrapper with a lightweight `index.html` entry that invokes the **same `home.js`**. No npm installation or build required.

## Run on Windows

1. Extract the ZIP. Open a terminal in the project root.
2. `cd frontend`
3. `py -m http.server 5500`
4. Open `http://127.0.0.1:5500/` (HTTP, not HTTPS).

Homepage, Register, Login, Tutor, Student, Parent and Admin routes use the original Figma code and styles. Example: `http://127.0.0.1:5500/tutor/requests.html` (login in Demo mode first).

## Publish to Netlify through GitHub

Commit the contents of this package at the repository root. In Netlify choose **Add new project → Import existing project → GitHub repo**; set the production branch (e.g. main) and **Publish directory: `frontend`**, **Build command: blank**. The included `netlify.toml` already sets this. The deployed site must be served from the domain root because original Figma URLs use absolute paths (`/student/...`, `/assets/...`).

### Updating an existing TutorPair repo safely

- Commit/push pending work in `TutorPair_Latest` before copying files.
- Pull the latest `main` from GitHub.
- Prefer creating a review branch (`git switch -c figma-latest-website`) so teammates can compare to the old V7.x files before merging.
- Copy the `frontend/`, `docs/`, `tests/` directories and `netlify.toml` into the clone, keeping the clone's `.git/`; review `git diff` carefully. The static site uses `frontend/index.html` and Figma's page assets; the old files left in the repo do not change this entry.
- Push the review branch and use a Pull Request; merge only when verified.

## Demo scenarios and features

- Email/password demo auth (browser-only), Student/Tutor/Parent roles and Admin demo switch.
- Weekly availability, matching, teaching courses, applications, BYOS invitations, four-lesson plan revisions, progress and reviews.
- Sidebar badges and notification bell from the uploaded Figma code.
- Tutor Requests page uses the existing source `tutor.js` + `tutor-flow.js`.
- Admin verification has client-side file previews when those files were attached from **the same browser**.

## Critical limitations

**This is a deployable interactive prototype, not a production multi-user service.** Data and demo credentials live in the browser; no secure backend authentication, shared database, real teacher verification, server file storage, payment/escrow, LINE pushes, cross-device BYOS sync or cross-account realtime delivery. Do not upload real identity documents or use real passwords/student data. A website URL can be shared, but each user's browser has independent sample/demo state.

## Basic automated tests

From project root (requires Node.js): `node --test tests/*.test.mjs`.

See `docs/FIGMA_WEB_DEPLOY_TH.md` for Thai steps and test checklist.
