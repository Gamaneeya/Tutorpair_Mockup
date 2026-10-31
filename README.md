# TutorPair — GitHub Ready MVP Demo

**HTML + CSS + Vanilla JS** interactive web prototype for the Nov 3 startup practice pitch. It supports **new-user → active-user journeys** for Students and Tutors, and a linked Parent progress view. It does not need Node.js, React, npm, API keys or a backend to run.

> **All users, credentials, prices, quizzes, ranking data, enrollments, verification approvals and LINE interactions are fictional demo data.** Do not use this app for actual tutoring, identity verification, payments or storing minors' information.

## Quick start on Windows

1. Extract the ZIP. In VS Code, open the folder containing this README.
2. Open a terminal and run:

```powershell
cd frontend
py -m http.server 5500
```

3. Visit **http://localhost:5500** in Chrome or Edge.
4. Click **Start demo** or **Log in**, then choose **New Student**, **New Tutor**, **New Parent** or **Returning Tutor**.

**Do not double-click the `.html` files**: the site uses JavaScript ES Modules and should be served through a local HTTP server. Only browser `localStorage` is used for demo persistence. Use the app header **Reset** to start over.

## What's new in this release

| Feature | What it does |
|---|---|
| New Tutor Onboarding | Three-step wizard: professional profile → subject/grade/price/schedule → 9 slider attributes |
| Add Subject / Course | Five-step course offering wizard: Category → Subject → Goal → Focus → Teaching details |
| Matching attributes | Student and Tutor use **the same 9 slider definitions** (five teaching preferences, four interaction preferences) |
| Hard filters + Weighted ranking | Approved tutor + subject + grade + class type + budget + schedule; then weights with a 9-slider preference fit |
| Verification gate | New tutor is invisible in matching until simulated Admin approval |
| My Students & Learning Plans | Student list, add/toggle/delete learning objectives, completed-objectives percentage |
| BYOS + group filling | Tutor creates a group with existing students, then simulates filling vacant marketplace seats |
| Parent Progress | Shares completed objectives and tutor session notes for the linked demo student |
| New/Returning | Empty dashboards for new accounts; realistic sample activity for returning accounts |

## Important demo navigation notes

**New Student (matching)**: Start **New Student** → Learning Request → fill 3 steps (the second contains all 9 sliders) → 1-second loading → top 3 qualified tutors (or fewer when eligible options are limited). Student profile and tutor profiles use the same 1–5 scale. Use the *How scores are calculated* disclosure to explain each weight.

**New Tutor**: Start **New Tutor** → **Tutor Profile** (3 steps) → **Teaching Subjects** (the legacy AddSubjectDialog concept reimplemented as a 5-step wizard) → **Verification** → switch app header **Demo view: Admin** → Tutor applications → Approve → switch back to Tutor → Student Requests / Small Groups → My Students & Learning Plans → Session Notes.

**Returning Tutor**: Start **Active Tutor** from Login → **My Students & Learning Plans** → check an objective or add a new one → **Small Groups** → simulate filling a seat → **Session Notes**. Use the top header **Demo view → Parent** to see shared progress for Nicha, the sample linked student.

**NOTE:** Starting a new scenario from public Login resets the demo. To keep changes when switching roles, use the **Demo view** dropdown in the top right instead.

## Project structure

```text
TutorPair_GitHub_Ready/
├── frontend/
│   ├── index.html, login.html, register.html
│   ├── student/                  Student journey pages
│   ├── tutor/                    Tutor journey + subjects.html + students.html
│   ├── parent/                   Parent progress and LINE preview
│   ├── admin/                    Admin verification simulation
│   └── assets/
│       ├── data/mock-data.js     <- EDIT SAMPLE TUTOR DATA HERE
│       ├── js/preferences.js     <- SHARED NINE SLIDER DEFINITIONS
│       ├── js/matching.js        <- HARD FILTERS + WEIGHTS
│       ├── js/store.js           <- Local demo state (future API)
│       ├── js/plans.js           <- Shared learning objectives
│       ├── js/tutor.js, student.js, parent.js, admin.js, public.js, ui.js, main.js
│       └── css/styles.css        <- Responsive styles
├── docs/
│   ├── DEMO_SCRIPT.md            3-minute presentation flow
│   ├── LEGACY_TUTOR_REUSE.md     Which older features were adapted
│   └── TUTOR_ONBOARDING.md       Onboarding and simulated verification notes
├── .gitignore
└── README.md
```

## Suggested weight configuration

`frontend/assets/js/matching.js`

| Component | Weight |
|---|---:|
| School topics and academic goal | 30% |
| Current level and teaching pace | 20% |
| Teaching preferences (9 sliders + approach/interaction) | 15% |
| Schedule overlap | 15% |
| Price fit | 15% |
| Tutor quality evidence (sample) | 5% |

The match score is a **heuristic suitability indicator**, not a statistical chance of grade improvement. No AI model is called to rank or explain tutors. Matching and explanatory highlights are deterministic. Real AI-generated explanations are a future enhancement.

## For the team

- **Edit mock content:** `frontend/assets/data/mock-data.js`.
- **Change slider meanings:** `frontend/assets/js/preferences.js` (edit once to affect both forms).
- **Change matching formula/weights:** `frontend/assets/js/matching.js`.
- **Change Tutor Form / Course Wizard / Student Plans:** `frontend/assets/js/tutor.js`.
- **Change Student Form:** `frontend/assets/js/student.js`.
- **Change styles:** `frontend/assets/css/styles.css`.
- **Add backend:** `frontend/assets/js/store.js` must be replaced with authenticated, role-scoped API calls and server-side authorization. LocalStorage and role switching provide **no real security**.

The old React/TSX project is deliberately **not included** in this repo. Neither `.env` nor API keys should be committed. Do not push the legacy project ZIP or `.git` history here.

## GitHub — first push

From inside `TutorPair_GitHub_Ready`, after creating the repository:

```powershell
git init
git add .
git commit -m "Build TutorPair interactive matching and tutor onboarding MVP"
git branch -M main
git remote add origin https://github.com/Gamaneeya/Tutorpair_Mockup.git
git push -u origin main
```

If the origin remote already exists, run `git remote set-url origin https://github.com/Gamaneeya/Tutorpair_Mockup.git` instead of `git remote add origin ...`.
