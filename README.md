# TutorPair — MVP Demo V3 (Simplified Forms & Verification)

**Working interactive prototype (HTML + CSS + vanilla JavaScript)** designed for the startup practice pitch on **November 3, 2026**. Students and tutors start with empty accounts, while a returning-user scenario showcases active courses, learner plans and parent reports.

> **Demo only:** Identity checks, user accounts, reviews, payments, LINE messages, tutor availability and quiz scores are simulated. No actual AI API, backend, database, payment gateway or LINE account is connected. Do not enter real student personal data or identity documents.

## Run locally on Windows

1. Extract this ZIP and open the `TutorPair_Verification_Simplified_MVP` folder in VS Code.
2. In a terminal at the project root:

```powershell
cd frontend
py -m http.server 5500
```

3. Open http://localhost:5500 in Chrome or Edge, choose **Log in** or **Start demo**.
4. Choose **New Student**, **New Tutor**, **Active Tutor** or **Linked Parent**. The role dropdown at the top **switches role without resetting the scenario**. Clicking a new scenario card on the Login page **resets all local demo data**.

## What changed in this revision

| Area | Current MVP behavior |
|---|---|
| Student matching form | Three brief steps. **No required Specific Topics and no nine-slider questionnaire**. Three short preferences: pace, teaching approach and interaction; each supports **No strong preference (skip)**. |
| Tutor onboarding | Professional profile, initial subject/grade eligibility, then tutor's supported responses to **the same 3 preference questions**. |
| Initial tutor verification | The tutor submits simulated identity / academic / teaching evidence. Admin approves identity and the **initial subject/grade scope once**. |
| Additional subject / grade | Tutor requests an additional subject or grade. Admin reviews **only that new request**; approved courses **stay active**. |
| New 1-on-1 course | Tutor can **publish and edit a course immediately** within approved subject and grade scope; **no repeat verification** for each new course, price or schedule. |
| Matching engine | Deterministic hard filters: only published listings from identity-verified tutors with approved subject/grade, acceptable format, schedule and price. Weighted rank uses academic goal, level/pace, schedule, price, the 3 preferences and sample quality. |
| Small groups + BYOS | Existing group creation/fill-seat workflow remains, restricted to an **approved subject/grade scope**. |
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

1. Choose **New Tutor** at `/login.html` → see **0 students / 0 lessons / ฿0 earnings**.
2. Open **Tutor profile** → complete 3-step form. Include Mathematics / M.4, availability and supported teaching preferences.
3. Submit **Verification** (simulation) → status becomes `pending`.
4. Change the top-right **Demo view** to **Admin** → **Tutor applications** → **Approve identity + initial subject**.
5. Return to **Tutor** → **Teaching subjects**. Mathematics / M.4 is approved.
6. Fill **Publish a course in an approved subject** → click **Publish course now**. No new Admin approval required.
7. Still on Teaching subjects, submit **Physics / M.4** as an additional subject. It is `Pending`. **The Mathematics course stays published.**
8. Switch to **Admin → Tutor applications**, approve only the Physics request. Back at Tutor, Physics/M.4 becomes an approved scope and can be used in a newly published course.
9. Try changing course price/schedule through **Edit listing**. It saves without verification.
10. For groups, enable *1-on-1 and small group* on the Tutor profile, then visit **Small groups**. Use an approved subject and grade.

## B. Test the STUDENT flow

1. Choose **New Student** or switch to the Student view in the current scenario.
2. Go to **Learning request**: Academic goal → **3 questions** → Schedule/Budget.
3. Submit to see **Finding matches…** followed by up to 3 actual ranked sample profiles.
4. Change the budget, subject or schedule and run again. Eligibility and weighted scores are recalculated from the inputs, not hardcoded in the result cards.
5. Select a tutor, then simulate a booking and package enrollment. The new student's Dashboard changes from empty to **Active learner** with a new course.

**Important:** If you switch to a different scenario using public Login, you reset your work. To inspect changes across roles use the top-right **Demo view**.

## C. Test the RETURNING tutor and parent

1. On the public Login page, choose **Active Tutor**.
2. Go to **My students & learning plans**, tick a goal and observe the completion percentage change.
3. Save a **Session note**. Switch the top-right Demo view to **Parent** and open **Progress report** to see the shared learning record.
4. **LINE preferences** shows a Flex Message-style preview; no real message is sent.

## Folder structure

```text
TutorPair_Verification_Simplified_MVP/
├── frontend/
│   ├── index.html, login.html, register.html
│   ├── student/*.html
│   ├── tutor/*.html
│   ├── parent/*.html
│   ├── admin/*.html
│   └── assets/
│       ├── data/mock-data.js  <- example tutors / approval scopes
│       ├── js/preferences.js  <- the 3 common preference questions
│       ├── js/matching.js     <- filters and weights
│       ├── js/store.js        <- browser demo state
│       ├── js/student.js      <- Student wizard/results/course
│       ├── js/tutor.js        <- Onboarding, course listing, requests, groups
│       ├── js/admin.js        <- Initial and subject-only approvals
│       ├── js/parent.js, js/plans.js, js/public.js, js/ui.js, js/main.js
│       └── css/styles.css
├── tests/matching.test.mjs
├── docs/
│   ├── REVIEW_THIS_VERSION.md
│   ├── DEMO_SCRIPT.md
│   └── ...
└── README.md
```

## Verify matching logic

```powershell
node tests/matching.test.mjs
```

From project root. Requires Node.js only for running the optional tests; **the website itself does not need npm or Node**.

## GitHub update (existing repository)

If the repository already exists on GitHub, **clone it first** and copy the files from this ZIP into the cloned project. Avoid creating a new unrelated Git history and avoid `git push --force`. Preserve the repo's `.git` folder and do not commit secrets, personal information or any `.env` from the older project.

> For real production, replace the role-switching/localStorage store with authenticated, permission-scoped APIs. Keep student-parent links and verification records protected on the server. The browser's role selector is for demonstration only.
