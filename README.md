# TutorPair — Data-Driven HTML Mockup (Prototype V2)

A browser-based **working TutorPair mockup** built with **HTML, CSS and vanilla JavaScript**. No TSX, React or `npm install` is needed. Contains 45 real HTML entry pages and a shared component renderer, with consistent responsive desktop/mobile UI.

> **PROTOTYPE ONLY.** All tutors, students, ratings, prices, statistics and progress shown are invented sample records. No real payment, login, matching, LINE messaging or consent verification is implemented.

## 1. Run on Windows (VS Code)

From the project root, open Terminal (PowerShell):

```powershell
cd frontend
py -m http.server 5500
```

Open **http://localhost:5500** in Chrome or Edge.

**Do not just double-click an HTML file.** The browser needs a local HTTP server to load JavaScript ES Modules correctly. The server is only for frontend demo development.

Alternatively, VS Code **Live Server** will work if its web root is `frontend/`.

## 2. Try it

1. Open the landing page at `/`.
2. Click **Log in**.
3. Select **Student**, **Tutor**, **Parent** or **Admin** from the demo role cards.
4. Student → **Learning request** → **Tutor matching**. Changing subject/grade/format/budget affects which example records qualify.
5. Tutor → **Session notes** → change topic/quiz and save. Log out and select Parent; **Parent dashboard** and **Learning progress** display the same updated data.
6. Tutor → **Create small group**, or **Group seats** → click **Simulate filling 1 seat**. The sample seat count changes.
7. Parent → **LINE settings** → connect/disconnect (simulated), toggle preferences; **Notifications** → show a sample LINE-looking report.
8. Use **Reset sample data** in the top right (desktop) to restore the defaults.

**Demo accounts are for navigation only** and use `localStorage`. They do not authenticate real users. Forms and demo actions are not connected to anyone else's accounts.

## 3. Where to edit data — MOST IMPORTANT

Open **`frontend/assets/data/mock-data.js`**.

```js
export const mockData = {
  people: { ... },
  tutors: [ ... ],             // Names, subjects, price, match samples
  student: { ... },            // Current package, quiz history, skills
  groupClasses: [ ... ],       // Group capacity, BYOS, platform seats
  latestNote: { ... },         // Tutor note shared with parent UI
  notifications: [ ... ],
  line: { ... },               // Demo notification preferences
  requests: [ ... ],
  earnings: [ ... ],
  admin: { ... }
};
```

Modify values there, **not in HTML**. Reload the browser. If you have already submitted demo forms, click **Reset sample data** first because browser-saved data takes priority over initial mock data.

For example, change `student.latestQuiz: 7` to `8`, or `latestNote.topic` to a new topic. Student and Parent components read from this shared source. For new content types, additional UI code may still be necessary, but ordinary content edits are centralized.

## 4. Folder structure

```text
TutorPair_Mockup_Ready/
├── frontend/
│   ├── index.html                   # Public landing entry point
│   ├── login.html, register.html    # Demo authentication UI
│   ├── find-tutors.html, for-tutors.html
│   ├── student/*.html               # Student URLs
│   ├── tutor/*.html                 # Tutor URLs
│   ├── parent/*.html                # Parent URLs
│   ├── admin/*.html                 # Admin URLs
│   └── assets/
│       ├── css/                    # base, public, workspace, components, responsive
│       │   └── styles.css          # Stylesheet entry point
│       ├── data/mock-data.js       # SAMPLE DATA: edit here
│       ├── js/data-source.js       # DATA ADAPTER: mock → API
│       ├── js/main.js              # Data initialization
│       ├── js/app.js               # Short role/page router
│       ├── js/core/                # Shared UI, events, session-note preview
│       ├── js/pages/               # Public, Dashboard, Student, Tutor, Parent, Admin
│       └── images/favicon.svg
├── docs/
│   ├── DATA_FLOW.md
│   └── API_MIGRATION.md
└── README.md
```

The 45 HTML files are intentionally **small routing shells**, not 45 copies of the same navigation/sidebar. Each file has real HTML `head`/`body` tags and identifies a route through `data-role`/`data-page`. The reusable UI renderer builds the page. This dramatically reduces duplicate HTML and CSS changes.

## 5. When real data is available

- For a one-time replacement of sample content, edit `mock-data.js`.
- For live database records, build an authenticated backend endpoint returning the **same object shape** as the mock data, e.g. `GET /api/bootstrap`, and switch `DATA_MODE` from `'mock'` to `'api'` in `assets/js/data-source.js`. Read-only page rendering can then use API records without rewriting the page layout.
- **Write actions still need work**: session notes, seat additions, payments, LINE settings, registration, verification, authentication etc. need proper POST/PATCH endpoints and access control. The current adapter intentionally rejects writes in API mode instead of silently faking them.
- Real pages must enforce authorization **on the server**, not only hide the sidebar. Parent-child linking and access to minors' data require particular care.

Read `docs/API_MIGRATION.md` for the next steps.

## 6. Visual design

Clean educational SaaS style, consistent brand purple/indigo, spacious cards, dashboards, information hierarchy, mobile navigation, deliberate empty states, visible demo labels. Styling is split into dedicated CSS files and imported by `assets/css/styles.css`; adjust brand tokens at the top of `base.css` to rebrand quickly.

## 7. Validation performed

- JavaScript syntax verified using `node --check`.
- All 45 page route render functions exercised in a lightweight Node DOM-stub smoke check with no exceptions.
- Project served with Python HTTP server and returned valid HTML. Full screenshot/interaction validation in Chromium **could not be completed in this environment due to browser navigation restrictions**; please validate the rendering locally using the setup above.
