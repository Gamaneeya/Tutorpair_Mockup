# TutorPair — MVP V7 Team Feedback Review

**V7 demo revision:** tutor rate validation, a clear file/video verification step, sample tutor-profile statistics and a personalized Why Matched sentence, playable **illustrative (silent) three-minute teaching-storyboard clips**, Tutor-side booking/worksheet/plan editing, Tutor-side reschedule approval, post-session note and dual reviews, plus Student punch-card/Revision Vault placeholders.

See **[V7 checklist](docs/TEAM_FEEDBACK_V7_CHECKLIST_TH.md)**, **[Figma prompt](docs/FIGMA_PROMPT_V7_EN.md)** and **[Git instructions](docs/GIT_UPDATE_V7_TH.md)**.

**Crucial limitations:** This remains a browser-only prototype; no real cross-device BYOS, file/video uploads, verified rating statistics, public review infrastructure, notifications, LINE Push, worksheet AI or payments. Teaching demo MP4s are original illustrated **silent samples** and do not represent a tutor's actual teaching ability.

Run logic tests: `node --test tests/*.test.mjs integrations/line/line-service.test.mjs`. The website itself needs only a local static HTTP server (`cd frontend && py -m http.server 5500`). Full browser end-to-end validation is still recommended; it could not be completed in the build environment.

---

# TutorPair MVP V6 — Team Feedback Interactive Prototype

Latest iteration of TutorPair for Thai M.1–M.6 online tutoring. Plain HTML/CSS/JavaScript, no build step. Keeps V5 BYOS and unified Student account.

## Quick start

```cmd
cd frontend
py -m http.server 5500
```

Open **http://localhost:5500/login.html**. Use the sample accounts section to switch between New / Active Student and Tutor, or register local fictional accounts.

## New in V6

| Area | Interactive demonstration |
|---|---|
| Tutor | Recurring availability picker Mon–Sun with per-day time windows; minimum ฿100 hourly rate; two verification evidence boxes (file name only / HTTPS link / local video preview) |
| Student | Regular / Sprint / Cram fixed 4-session packages with 60/90/120-minute sessions; weekly time windows; live max-course-budget calculation |
| Matching | Same verified subject/grade checks; time-window + lesson-duration checks; richer Top 3 cards including example course price, Why Matched, optional video and common 4-lesson roadmap |
| After selection | Request → simulate tutor accept/reject → tutor edits plan → simulate authorized plan approval → mock checkout and enrollment |
| Progress | Four-lesson status tracker; private student clarity/pace feedback; simulated reschedule/cancel actions |
| Tutor session notes | Engagement 1–3, homework checkbox, short notes and optional annotated-PDF filename; no required quiz scores |
| Parent | Monthly private feedback and report/LINE message preview; no actual LINE push |
| BYOS | Keeps same-browser class invitation and student reuse for another subject, NOT cross-device enrollment |
| Demo | Navbar Quick Toggle: New Student / Active Student / New Tutor / Active Tutor |

## Team docs

- **[`docs/TEAM_FEEDBACK_V6_TH.md`](docs/TEAM_FEEDBACK_V6_TH.md)** — feature/status table, exact Demo Flows and production handoff
- **[`docs/GIT_DEPLOY_V6_TH.md`](docs/GIT_DEPLOY_V6_TH.md)** — safe Git update steps, local run and Netlify deployment
- [`docs/BYOS_DEMO_HANDOFF.md`](docs/BYOS_DEMO_HANDOFF.md) — BYOS design, same-browser link acceptance and API proposal
- [`docs/LOGIN_DEMO_HANDOFF.md`](docs/LOGIN_DEMO_HANDOFF.md) — login simulation and auth APIs
- [`docs/PARENT_LINE_INTEGRATION_HANDOFF.md`](docs/PARENT_LINE_INTEGRATION_HANDOFF.md) — LINE/parent API proposal
- [`docs/V5_ORIGINAL_README.md`](docs/V5_ORIGINAL_README.md) — original V5 handoff, retained for reference

Existing PNG previews in `docs/` show **V5 screens**, not the revised V6 form layout.

## Tests

From project root:

```cmd
node --test tests/*.test.mjs integrations/line/line-service.test.mjs
```

Node is needed only for tests. Website runs as static files served from `frontend`.

## Honest limitations

This is **an interactive browser demo, not a production service**. Login/password, roles, Tutor verification, enrollment, lesson timestamps, AI worksheet analysis, payments/escrow, public-review release, and LINE account linking/push are **not connected to a secure backend**. Real documents and video file bytes are **not uploaded**; a temporary local video preview is possible before refreshing. BYOS invite/roster syncing works only between two registered demo accounts on the **same browser + origin**. In production a backend/database must enforce tutor/student/parent permissions, class capacity, scheduling and privacy.

**Do not enter real passwords, identity documents, student worksheets containing personal data, or sensitive child information.**

Deploy note: `netlify.toml` publishes `frontend` at the website root. GitHub Pages project subpath requires additional base-path changes; don't assume deployment to `/<repo>/` works directly.
