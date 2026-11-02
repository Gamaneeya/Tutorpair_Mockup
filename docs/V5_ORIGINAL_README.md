# TutorPair — MVP Demo V5: BYOS Invitations + Unified Student Account

**Working interactive prototype (HTML + CSS + vanilla JavaScript)** designed for the startup practice pitch on **November 3, 2026**. Students and tutors start with empty accounts, while a returning-user scenario showcases active courses, learner plans and parent reports.

> **Demo only:** Registration and email/password sign-in work locally in a single browser, but **there is no real authentication server**. Identity checks, reviews, payments, LINE messages, tutor availability and quiz scores are simulated. No actual AI API, backend, database, payment gateway or LINE account is connected. Do not enter real student personal data or identity documents.

**New in V5:** BYOS Tutor invitation links (same-browser demo), student class joining, multi-class Student Dashboard, and Find Another Tutor without creating a second student account. **Start with [`docs/BYOS_DEMO_HANDOFF.md`](docs/BYOS_DEMO_HANDOFF.md)** for two demo scripts and backend handoff.

**For Login/backend teammate:** see `docs/LOGIN_DEMO_HANDOFF.md` for the login flow and the server APIs needed for production.

**For LINE teammate:** see `docs/PARENT_LINE_INTEGRATION_HANDOFF.md` and `integrations/line/line-service.mjs` for the server-side integration points. The existing Parent LINE page is intentionally still a mock preview until an authenticated backend exists.

## Run locally on Windows

1. Extract this ZIP and open the `TutorPair_Login_Flow_MVP` folder in VS Code.
2. In a terminal at the project root:

```powershell
cd frontend
py -m http.server 5500
```

3. Open http://localhost:5500 in Chrome or Edge. Click **Sign up** to choose Student, Tutor or Parent, enter a made-up email and password, and start from a blank dashboard.
4. Click **Log out**, then **Log in** with the same demo credentials to restore the saved local workspace.
5. For a fast presentation, open **Log in → Explore sample accounts without registering** and choose **New Student**, **New Tutor**, **Active Tutor**, or **Linked Parent**. Only these sample scenarios show the role switcher. Registered accounts keep their own role and separate local state.

## New in V5 — BYOS + cross-subject learning sample

**Fast preview:** `/login.html` → **New Student** → **Load sample BYOS Mathematics class** → **Find Another Tutor** → Physics matching → book/enroll → **My classes** shows Math (BYOS) and Physics (TutorPair) side-by-side.

**Shareable link preview (same browser only):** Register Tutor → approve in demo → create Small Group → **Invite students (BYOS)** → generate link → log out → register/login as Student via link → accept → Student My classes → Find Another Tutor. **No new Student account is needed for the second subject.**

Read the exact steps, edge cases, API handoff and warnings: [`docs/BYOS_DEMO_HANDOFF.md`](docs/BYOS_DEMO_HANDOFF.md).

## Inherited from V4 — functional account-form demo

| Feature | Behavior |
|---|---|
| Register | Select Student / Tutor / Parent, enter name, email and a **fictional** password (with confirmation). |
| Log in | Enter email + demo password; incorrect credentials show an error. |
| Log out | Clears session but keeps the account's local data. |
| Restore account | Log in again with the same credentials to return to that role's dashboard. |
| Multiple accounts | Student / Tutor / Parent local profiles have separate browser storage. |
| Protected mock pages | Unauthenticated visitors are redirected to `/login.html`; signed-in accounts cannot switch roles. |
| Presentation short-cuts | The previous new/returning sample flows remain under a collapsible section on the Login page. |

**Not a production login:** All login logic is executed in the user's browser; a backend, secure server-side sessions and shared database are required before deployment with real users. Do not use genuine passwords or real personal data. The V5 BYOS flow selectively updates the registered Tutor and Student workspaces on the **same browser/origin**, but is not cross-device or server-based. Parent LINE integration and shared reports between registered accounts still require a backend. The sample role switcher is separate from this invitation flow.

## What changed in the previous revision

| Area | Current MVP behavior |
|---|---|
| Student matching form | Three brief steps. **No required Specific Topics and no nine-slider questionnaire**. Three short preferences: pace, teaching approach and interaction; each supports **No strong preference (skip)**. |
| Tutor onboarding | Professional profile, initial subject/grade eligibility, then tutor's supported responses to **the same 3 preference questions**. |
| Initial tutor verification | The tutor submits simulated identity / academic / teaching evidence. Admin approves identity and the **initial subject/grade scope once**. |
| Additional subject / grade | Tutor requests an additional subject or grade. Admin reviews **only that new request**; approved courses **stay active**. |
| New 1-on-1 course | Tutor can **publish and edit a course immediately** within approved subject and grade scope; **no repeat verification** for each new course, price or schedule. |
| Matching engine | Deterministic hard filters: only published listings from identity-verified tutors with approved subject/grade, acceptable format, schedule and price. Weighted rank uses academic goal, level/pace, schedule, price, the 3 preferences and sample quality. |
| Small groups + BYOS | Create groups within an **approved subject/grade scope**; generate invite links for registered student accounts in the same browser. New groups start with 0 BYOS seats until students accept invitations. |
| Progress and parents | Tutor notes, student objectives and linked parent progress continue using local sample state. LINE is a message **preview**, not an API integration. |

### Matching weights

Configured in `frontend/assets/js/matching.js`:

| Factor | Weight |
|---|---:|
| Academic Goal Fit | 30% |
| Student Level & Lesson Pace | 20% |
| Schedule Overlap | 15% |
| Price Fit | 15% |
| Teaching & Interaction Preferences (3 questions) | 15% |
| Tutor Quality Evidence (demo value) | 5% |

*The compatibility score is a heuristic ranking aid, not a prediction of grades or evidence of an objectively better learning style.* The result says **Top 3** only when three eligible tutors exist; otherwise it shows fewer or a no-match state. The loading screen is a presentation animation over a real deterministic calculation, **not an AI inference call**.

## A. Test the NEW TUTOR journey

1. Create a **Tutor** account at `/register.html` (or use **New Tutor** from the sample scenarios in `/login.html`) → see **0 students / 0 lessons / ฿0 earnings**.
2. Open **Tutor profile** → complete 3-step form. Include Mathematics / M.4, availability and supported teaching preferences.
3. Submit **Verification** (simulation) → status becomes `pending`.
4. For a **sample demo** switch top-right **Demo view** to **Admin** and approve the application. For a **registered Tutor account**, use the clearly labeled **Simulate Admin approval (demo only)** button on Verification; role switching is intentionally disabled for registered accounts.
5. Return to **Tutor** → **Teaching subjects**. Mathematics / M.4 is approved.
6. Fill **Publish a course in an approved subject** → click **Publish course now**. No new Admin approval required.
7. Still on Teaching subjects, submit **Physics / M.4** as an additional subject. It is `Pending`. **The Mathematics course stays published.**
8. For a **sample demo**, switch to **Admin → Tutor applications** to approve Physics. For a **registered Tutor account**, click **Simulate additional subject approval (demo only)** on Teaching Subjects. Back at Tutor, Physics/M.4 becomes an approved scope and can be used in a newly published course.
9. Try changing course price/schedule through **Edit listing**. It saves without verification.
10. For groups, enable *1-on-1 and small group* on the Tutor profile, then visit **Small groups**. Use an approved subject and grade.

## B. Test the STUDENT flow

1. Create a **Student** account at `/register.html` or choose **New Student** from sample scenarios.
2. Go to **Learning request**: Academic goal → **3 questions** → Schedule/Budget.
3. Submit to see **Finding matches…** followed by up to 3 actual ranked sample profiles.
4. Change the budget, subject or schedule and run again. Eligibility and weighted scores are recalculated from the inputs, not hardcoded in the result cards.
5. Select a tutor, then simulate a booking and package enrollment. The new student's Dashboard changes from empty to **Active learner** with a new course.

**Important:** If you switch to a different scenario using public Login, you reset your work. To inspect changes across roles use the top-right **Demo view**.

## C. Test the RETURNING tutor and parent

1. On the public Login page, expand **Explore sample accounts without registering** and choose **Active Tutor**.
2. Go to **My students & learning plans**, tick a goal and observe the completion percentage change.
3. Save a **Session note**. Switch the top-right Demo view to **Parent** and open **Progress report** to see the shared learning record.
4. **LINE preferences** shows a Flex Message-style preview; no real message is sent.

## Folder structure

```text
TutorPair_BYOS_Unified_Student_MVP/
├── frontend/
│   ├── index.html, login.html, register.html, join.html
│   ├── student/*.html
│   ├── tutor/*.html (including invite.html)
│   ├── parent/*.html
│   ├── admin/*.html
│   └── assets/
│       ├── data/mock-data.js  <- example tutors / approval scopes
│       ├── js/byos.js         <- browser BYOS invitation/join demo
│       ├── js/join.js         <- public invitation page
│       ├── js/auth.js         <- browser-only registration / login simulator
│       ├── js/preferences.js  <- the 3 common preference questions
│       ├── js/matching.js     <- filters and weights
│       ├── js/store.js        <- browser demo state
│       ├── js/student.js      <- Student wizard/results/course
│       ├── js/tutor.js        <- Onboarding, course listing, requests, groups
│       ├── js/admin.js        <- Initial and subject-only approvals
│       ├── js/parent.js, js/plans.js, js/public.js, js/ui.js, js/main.js
│       └── css/styles.css
├── tests/byos.test.mjs
├── tests/auth.test.mjs
├── tests/matching.test.mjs
├── docs/
│   ├── REVIEW_THIS_VERSION.md
│   ├── DEMO_SCRIPT.md
│   └── ...
└── README.md
```

## Verify matching logic

```powershell
node tests/byos.test.mjs
node tests/auth.test.mjs
node tests/matching.test.mjs
```

From project root. Requires Node.js only for running the optional tests; **the website itself does not need npm or Node**.

## GitHub update (existing repository)

If the repository already exists on GitHub, **clone it first** and copy the files from this ZIP into the cloned project. Avoid creating a new unrelated Git history and avoid `git push --force`. Preserve the repo's `.git` folder and do not commit secrets, personal information or any `.env` from the older project.

> For real production, replace the browser-only account simulation, role-switching/localStorage store with authenticated, permission-scoped APIs. Keep student-parent links and verification records protected on the server. The browser's role selector is for demonstration only.
