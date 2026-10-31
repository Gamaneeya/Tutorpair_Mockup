# TutorPair Parent + LINE integration handoff (for teammate)

## What is actually working now?
- `frontend/assets/js/tutor.js` -> `notes()` accepts a session-note form. `mutate()` saves to `localStorage` via `frontend/assets/js/store.js`.
- `frontend/assets/js/parent.js` -> `dashboard()` and `progressPage()` read the *same browser state*. When switching demo roles in the same browser, the report appears.
- `frontend/assets/js/parent.js` -> `line()` is only a **Flex-style HTML preview**, and `lineConnected` is a local boolean. It does NOT call LINE.
- No backend, database, auth, actual parent-child verification, LINE OAuth, OA push, or webhook is present.

## Desired parent flow
1. Student/parent verifies the guardianship relationship (secure consent/verified invitation, not publicly guessable child ID).
2. Parent adds TutorPair LINE Official Account as friend and opens Connect LINE (LIFF / LINE Login).
3. LIFF obtains an `idToken` with `liff.getIDToken()`; send it to authenticated TutorPair endpoint `POST /api/parents/line/connect` over HTTPS.
4. Server verifies token with LINE, gets `sub` (LINE User ID), saves to the authenticated Parent's record. The LINE Login channel and OA Messaging API channel MUST be under the same LINE Provider to share user IDs.
5. Tutor submits session report to authenticated `POST /api/session-notes`. Backend verifies tutor-student assignment; saves report.
6. Backend queues one notification for each authorized, opted-in parent; background worker calls `POST https://api.line.me/v2/bot/message/push` with LINE channel access token.
7. Parent receives a minimal Flex Message and taps View report, opening a secure Parent report page or LIFF. Server checks linked parent permissions before showing data.
8. Parent may unlink LINE and withdraw notifications at any time. Handle LINE OA block/unfollow, API errors, quota, retries, and duplicate jobs.

## Frontend -> backend API contracts to implement

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/parents/link-child` | Parent session + verified consent | Link student to guardian |
| POST | `/api/parents/line/connect` | Parent session + LIFF ID token | Verify LINE identity and save LINE User ID |
| DELETE | `/api/parents/line/connect` | Parent session | Unlink LINE account |
| GET | `/api/parents/line/status` | Parent session | Real connection / opt-in state |
| POST | `/api/session-notes` | Tutor session + assignment check | Store note and enqueue notification |
| GET | `/api/parents/children/:studentId/progress` | Parent session + verified relationship | Read latest note/progress |

Recommended tables: `users`, `parent_student_links`, `line_accounts`, `line_notification_preferences`, `courses`, `enrollments`, `session_notes`, `notification_outbox`. Use unique `(report_id, parent_id)` for notification jobs. These are proposed schemas, not current DB tables.

## Where to wire the existing frontend

### 1. `tutor.js` / `notes()` submit handler
Today: `mutate(s => {s.notes.push(note) ...})` (local demo only).
Future: perform `fetch('/api/session-notes', {method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(note)})` from an authenticated tutor session. Backend derives `tutorId` from auth, not from request JSON. Only show saved after 2xx, and do not independently POST to LINE in the browser. Publishing, editing and deleting need proper notification rules.

### 2. `parent.js` / `line()` connect handler
Today: toggle `s.parent.lineConnected` in browser.
Future: show Connect button that launches LIFF or LINE Login (LIFF app must be configured), obtain an ID token and POST it to `/api/parents/line/connect`. `GET /api/parents/line/status` determines the real Connected label. **Do not send LINE profile.userId from the browser as proof of identity.**

### 3. `parent.js` / `progressPage()`
Today: `s.notes` from localStorage.
Future: read `GET /api/parents/children/:studentId/progress`, with auth/permission verified on server. An authenticated parent can only read their linked children.

### 4. Parent report link in LINE
Use `https://YOUR_PUBLIC_SITE/parent/progress.html` (or your future LIFF URL), not `http://localhost:5500/parent/progress.html`. A URL is **only a button destination**. The LINE push is issued by the backend separately; the parent is authorized before the report is loaded.

## Run example tests (no network / API keys)
From project root:

```powershell
node --test integrations/line/line-service.test.mjs
```

This folder provides an example server-side notification builder, LINE Push call, and LIFF ID token verification helper. `workflow.example.mjs` is a reference contract using hypothetical DB methods; it cannot run until an authenticated API/database is implemented. No secret tokens included. Do not import these server-side files in static HTML.

## LINE Developer setup
- Create LINE Official Account with Messaging API channel.
- Create LINE Login channel + LIFF app under **same Provider** as the Messaging API channel.
- Store channel access token in backend environment, NEVER frontend/committed `.env`.
- Deploy backend on HTTPS and set webhook with signature verification if receiving LINE follow/unfollow/account-linking events.
- Add friend / valid recipient condition matters; push may fail or be undelivered if account blocks OA.
- For privacy (minors), avoid scores, names, and sensitive notes in LINE preview; use the secured report page for detail.

Official docs (checked Nov 2026):
- https://developers.line.biz/en/docs/messaging-api/sending-messages/
- https://developers.line.biz/en/docs/messaging-api/linking-accounts/
- https://developers.line.biz/en/docs/liff/using-user-profile/
- https://developers.line.biz/en/docs/line-login/getting-started/
