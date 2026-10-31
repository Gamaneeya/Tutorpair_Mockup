# Replacing mock records with a backend

## Scope and reality check

The user interface is deliberately **data-driven** so the *displayed content* can switch from mock objects to API data with minimal UI edits. This does **not** mean that building authentication, secure payments, booking, consent, account-linking, messaging, and database writes is a one-line change.

## Read path (prepared)

`frontend/assets/js/data-source.js` contains:

```js
export const DATA_MODE = 'mock';
export const API_BOOTSTRAP_URL = '/api/bootstrap';
```

When a secured backend can return an object with the same fields as `mockData`, use `DATA_MODE = 'api'`.

The project loads that object asynchronously in `assets/js/main.js` and then renders the same page templates. No need to replace every HTML file or every card.

In production, avoid returning every student, every parent's records, or admin financial records to a single user. Instead use **role-scoped bootstrap results** or individual endpoints. The present unified object is only for a tiny local demo.

## Write path (not yet connected)

Suggested future API routes:

| Workflow | Example endpoint | Required authorization |
|---|---|---|
| Login/session | POST /api/auth/login | Server-managed session |
| Current user | GET /api/me | Authenticated |
| Student tutor matching | POST /api/matching/requests | Student or authorized parent |
| Student course list | GET /api/students/:id/courses | Linked student or parent |
| Tutor session note | POST /api/lessons/:id/notes | Assigned tutor |
| Tutor small group | POST /api/groups | Verified tutor |
| Group vacancy | POST /api/groups/:id/seats | Authorized tutor/booking service |
| Parent progress | GET /api/students/:id/progress | Linked parent or student |
| Parent LINE link | POST /api/line/link | Parent with verified identity |
| LINE webhook | POST /api/line/webhook | Signature verification |
| Payouts | GET /api/tutors/me/payouts | Authorized tutor |
| Refund requests | POST /api/refunds | Eligible buyer/admin |

Backend must validate every operation; browser role fields, mock `localStorage` accounts and hidden navigation are **not security controls**.

## LINE integration

The UI currently has:
- Parent settings for LINE
- Connected status and notification preferences
- Mock LINE-style message preview
- Shared parent progress from the tutor's notes

Production would need a LINE Official Account and Messaging API channel, secure parent-LINE account linking, webhook signature verification, token storage on the server, user consent, delivery status, opt-out handling, and careful message frequency/cost design.

Keep private student data behind authenticated, authorized TutorPair reports. LINE should carry concise notices and a link to the website, not all sensitive details.
