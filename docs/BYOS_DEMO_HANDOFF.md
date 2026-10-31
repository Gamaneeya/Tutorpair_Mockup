# TutorPair V5 — BYOS & Unified Student Account (demo handoff)

> Browser-only interactive sample, not production enrollment. Use invented personal details and passwords. No payments, verified identity, server-side permissions, real-time syncing between browsers, or LINE pushes.

## What we are illustrating

**BYOS (Bring Your Own Students)** is an **enrollment source** (`BYOS`) rather than an account type. The same Tutor and Student accounts use the same dashboards whether a learner is tutor-invited or discovered through TutorPair matching. `source` belongs to an enrollment/class, not a global `student.isBYOS` flag.

| Feature | Working interactive example? |
|---|---|
| Tutor creates a small group within an approved subject and grade | Yes — browser demo |
| Tutor generates a class-specific invite link | Yes — only stored in this browser |
| Student logs in/registers, then returns to invitation | Yes |
| Student accepts invite; tutor roster/seat counts update | Yes — for registered accounts **on the same browser and origin** |
| Student adds another tutor via normal matching | Yes — matching uses sample tutor catalog |
| Student sees BYOS and TutorPair classes together | Yes |
| Enrollment sources tracked per course (`BYOS`, `TutorPair`) | Yes |
| Marketplace commission charged | No — hypothetical model only |
| Tutor session report shared from registered tutor account into student's account | Not yet — needs backend |
| Parent links, LINE messages, payment, approval, cross-device invites | Not connected |

## Demo A — Fast sample for teammates (~1 minute, no form setup)

1. Serve `frontend` locally, visit `http://localhost:5500/login.html`.
2. Expand **Explore sample accounts without registering** → **New Student**.
3. On Student Dashboard, click **Load sample BYOS Mathematics class**.
4. The Math class shows `Joined by tutor invitation` (preloaded sample, not a real invitation).
5. Click **Find Another Tutor**. The request preselects **M.4** and **Physics**, and keeps prior preferences when available.
6. Proceed through the three short steps (budget at least ฿460/hour and choose Saturday) → Find matches → select P'Fern → request a lesson → **Simulate tutor approval + package enrollment**.
7. Go to **My classes**. Both **Math (BYOS)** and **Physics (TutorPair Matching)** are there.

This first demo uses one sample Student state. No verification, real parent, payment, or external message occurs.

## Demo B — End-to-end invitation flow with two registered demo accounts

**Important:** use the **same computer, browser profile, hostname and port** (e.g., localhost:5500 throughout). Local browser storage is not shared across other computers, incognito windows or domains. An invitation URL pasted into a teammate's browser **will not work** until a real backend/database exists.

1. Go to `/register.html?role=tutor`, register a fictional Tutor account.
2. Tutor Profile → complete the 3-step profile, choose **Mathematics**, **M.4**, enable **1-on-1 and small group** and check Saturday among available times.
3. Tutor Verification → submit → click **Simulate Admin approval (demo only)**.
4. Small groups → create *M.4 Mathematics BYOS Group*, 4 seats, Saturday → **Publish demo group**. Seat count starts at 0.
5. Tutor sidebar → **Invite students (BYOS)** → choose the group → **Generate invitation link** → **Copy link**.
6. Tutor dashboard → **Log out**.
7. Open the copied invitation URL in the **same browser**. Click **Create Student account** (or Login if already registered). After signup you should automatically return to the invitation page.
8. Click **Accept invitation & join**. Student → **My classes** shows the invited Math class.
9. Student → **Find Another Tutor**. Choose Physics or a second subject. The grade is reused; preferences can be skipped. Complete matching, booking and simulated enrollment.
10. Student → **My classes** shows Math and Physics together. **Log out** → log back in as Tutor → **Invite students (BYOS)** or **My students & learning plans** to see that BYOS student and updated seat count.

Invite handling is idempotent; accepting the same invite twice never occupies another seat. When the class reaches capacity, new memberships are rejected in the demo. Tutor approval and approved subject/grade are checked at invite generation and at acceptance.

## UI changes

- Tutor sidebar: **Invite students (BYOS)**; invite-link generation and per-group seat counts.
- Tutor **Small groups**: don't manually enter fake BYOS counts. Open with 0 seats occupied and invite actual demo accounts.
- Student sidebar: **Join invited class**, plus existing **Learning request** and **My courses**.
- Student Overview: **Find Another Tutor**, BYOS / marketplace course cards and source badges.
- Student Learning request: defaults to their current grade, a different subject from their latest enrolled course, and existing answers where available.
- Student My classes: multiple active enrollments and distinct enrollment-source badges.

## Data model proposal (production)

```text
users(id, role, name, email, password_hash)
tutors(id, user_id, verified_status)
tutor_approved_scopes(id, tutor_id, subject, grades, status)
classes(id, tutor_id, subject, grade, capacity, schedule, price, visibility)
class_invites(id, class_id, token_hash, created_by_tutor, expires_at, revoked_at)
enrollments(id, class_id, student_user_id, source, status, joined_at,
            price_snapshot, marketplace_fee_policy_id)
student_learning_preferences(student_user_id, pace, approach, interaction)
learning_requests(id, student_user_id, subject, grade, goal, schedule, budget)
```

On actual backend:

1. `POST /api/tutor/classes/{classId}/invites` — ensure tutor owns class, has approved subject+grade; create secure random invitation token (store only hash). Invalidate/revoke as needed.
2. `GET /api/invitations/{token}` — return a safe public class preview, not private roster or personal records.
3. `POST /api/invitations/{token}/accept` — authenticated **Student**; validate token expiry/revocation, class availability, tutor eligibility, membership and capacity **in one database transaction**; record source `BYOS` server-side (not user-controlled).
4. `GET /api/students/me/enrollments` — return all joined classes regardless of source.
5. `POST /api/students/me/learning-requests` — retain existing grade/preferences; match other approved offerings.
6. `POST /api/tutors/me/session-reports` — verify tutor-student enrollment relationship; write report and make it accessible to authorized student/parent users; enqueue LINE push for consented/linked guardians.

Important checks: anti-overbooking, duplicate membership, tutor-verified subject/grade, authenticated Student, invitation ownership/expiry/revocation, no client-specified commission source, consent/authorization for parent and child data. Do not build production authentication or authorization using `localStorage`.

## Files to review with teammate

- `frontend/assets/js/byos.js`: invite model, group admission, per-account local storage demo.
- `frontend/assets/js/join.js`, `frontend/join.html`: student invitation and auth return flow.
- `frontend/assets/js/student.js`: multi-course cards + Find Another Tutor + sample loader.
- `frontend/assets/js/tutor.js`, `frontend/tutor/invite.html`: tutor BYOS UI and group publishing.
- `frontend/assets/js/store.js`: legacy single-course compatibility plus a `student.courses[]` array.
- `tests/byos.test.mjs`: one Tutor/Student browser-storage scenario and edge cases.

## How to put this revision on GitHub

Use the existing `TutorPair_Latest` clone containing `.git`, copy all files from this V5 ZIP into it **without deleting repository-only files**, review `git status` and `git diff` before committing, then push `main`. Do not run `git init` inside the ZIP and never force-push teammates' work.
