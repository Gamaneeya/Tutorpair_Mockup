# TutorPair MVP V7 — Team feedback checklist & handoff

**สถานะ:** Interactive HTML/CSS/vanilla JavaScript demo (not deployed production backend). Build on top of V6; keep unified Student account + BYOS.

## จุดที่เพิ่ม/แก้ใน V7

| Feedback | V7 implementation | สถานะ |
|---|---|---|
| Tutor preferred rate below ฿100 | Tutor Onboarding shows **Please enter at least 100 THB/hr.** specifically on Continue and Submit | Demo UI ✓ |
| Verification Box 2 confusing filename | Actual file picker **OR** HTTPS video URL, local preview and clear Required message; Admin sees chosen filename/link only | Demo UI ✓; files not uploaded |
| Tutor profile stats absent | Sample faculty, self-reported GPA/honors, rating/review count, illustrative completed platform hours, renewal % and teaching introduction on cards; clearly marked sample | Sample values ✓; not verified backend metrics |
| Why Matched should be a sentence | Natural personalized explanation referencing matched preferences; graceful fallback for Skip | Demo UI ✓ |
| Audition button says no video | Expandable **Click here to see 3 mins Demo** with actual playable *illustrative silent teaching storyboard* for Mathematics, Physics, English; NOT genuine tutor audition or verification evidence | Video UI ✓; real tutor uploads pending |
| Tutor receives Worksheet + Draft Plan | Tutor → Student requests shows worksheet **filename** + 4-lesson baseline + student note, for the shared sample demo state | Same-browser demo ✓; file content not uploaded |
| Tutor adjusts topics AND pacing; Send Plan | Tutor → Student requests → Accept → edit all 4 topics + pacing → Send Plan to Student → Student Booking review/approval | Shared sample demo ✓ |
| Tutor receives reschedule/cancel Accept / Reject | Tutor → Student requests has direct action cards for Student Progress session-change requests | Shared sample demo ✓; 24h policy not enforceable without scheduled timestamps |
| Progress Revision Vault / punch-card | Student Progress has 4-session visual punch card and annotated GoodNotes PDF filename list | Demo UI ✓; no PDF storage/download |
| Tutor → Student after-class evaluation | Tutor Session notes: engagement 1–3, homework checkbox, one sentence, annotated PDF filename and follow-up note. Student/Parent preview in shared sample | Demo UI ✓; LINE push not live |
| Both-side public review after lesson 4 | Student Progress and Tutor Session notes capture their reviews; reveal in shared demo when both submit, or after 14 days from first submission | Local demo ✓; real public review moderation/backend pending |
| BYOS invitation | V5 same-browser invite/accept/capacity flow retained and tests remain green | Same-browser demo ✓; cross-device NOT implemented |

## Previously completed in V6 (kept)

- Tutor / Student recurring Mon–Sun availability with time windows.
- Four-session packages: Regular Pace (4 weeks), Exam Rescue (2 weeks), Emergency Cram (1 week); 60/90/120 minutes.
- Maximum hourly budget x total hours UI; card total uses tutor-specific rate, excludes unfinalized platform fee.
- Deterministic hard-filter + top 3 ranking, common baseline four-lesson roadmap (not true AI worksheet processing).
- New/Active demo switch, registered browser-only Email/Password login, multiple student courses in one dashboard.
- Student after-session clarity and pacing feedback, Parent monthly feedback and LINE Flex preview.

## Guided demo: Student → Tutor → Student (single Sample session)

1. Start local server from `frontend`: `py -m http.server 5500`; open `http://localhost:5500/login.html`.
2. Expand **Explore sample accounts without registering** → **Active Student**.
3. Go to **Learning request** and select Mathematics / M.4 / Regular / available days, with an optional **dummy worksheet filename**; finish request.
4. In **Your matches**, compare a real sample rating, teaching intro, full-price calculation, personalized Why Matched sentence and **illustrative video**. Select compatible tutor (for the cross-role demo choose **P’Mew**).
5. Click **Request a lesson** on Booking. Student shows **Waiting for tutor**.
6. Top nav **Demo view → Tutor** → **Student requests**. Review worksheet name and plan, **Accept**, edit four topics and pacing and click **Send Plan to Student**.
7. Top nav **Demo view → Student** → **Booking**. Review new plan/pacing; approve, mock checkout, then open **My classes / Progress**.
8. On Student Progress, request Reschedule or Cancel for an upcoming lesson.
9. Switch Demo view → **Tutor → Student requests**; click **Accept** or **Reject** in the session-change card. Switch back to Student Progress to see status.
10. For evaluation demo, use **Tutor → Session notes**, with engagement, homework, 1-sentence summary, optional **dummy GoodNotes PDF filename**. Parent view shows report in the same shared sample state; **LINE remains preview only**.
11. For public review gate after four lessons, choose an already completed Sample course in Active Student Progress, submit Student review, switch Tutor → Session notes and submit Tutor review, then switch back to Student to see the local reveal.

**Important:** In Sample mode, switching the top nav `Demo view` shares one scenario state. In registered Tutor/Student accounts, real bookings and session-note sharing across users are NOT synchronized; that requires backend/API authentication and data storage. BYOS join works only between registered accounts on the same browser/origin, not in the Sample role switcher.

## What is NOT implemented yet

1. Real cross-device BYOS invite tokens / persisted enrollment DB / tutor notification service.
2. Real file upload/storage/retrieval of transcript, worksheet, 3-min demo video or annotated GoodNotes PDF.
3. Generative AI reading worksheet and generating personalized plans.
4. Payment gateway / PromptPay escrow / confirmed platform commission fee.
5. Actual LINE OAuth/LIFF/Messaging API push / parental authorization.
6. Real attendance validation, verified taught hours, renewal percentages, 24-hour cancellation policy, public review visibility rules and moderation.

## Tests

```powershell
node --test tests/*.test.mjs integrations/line/line-service.test.mjs
```

Automated unit/integration demo tests: 13 tests, all passed during build. A full browser navigation test could not be executed in the build environment, so the team should review the listed flows manually before presenting.

## Key files changed from V6

- `frontend/assets/js/tutor.js` — rate validation, 2-box video verification refinement, tutor inbox and replies, notes/reviews.
- `frontend/assets/js/student.js` — match cards, narrative, video player, booking status, Progress UI and public review gate.
- `frontend/assets/js/store.js` — safe sample metadata backfill for V6 localStorage + Active Sample learning progress.
- `frontend/assets/data/mock-data.js` — illustrative tutor metrics + sample teaching clips.
- `frontend/assets/js/parent.js` — remove legacy score-stat presentation.
- `frontend/assets/css/styles.css` — UI additions.
- `frontend/assets/demo/*.mp4` — 3 short *illustrative silent slide videos*, ~3 minutes each, not tutors' real demo footage.
- `tests/feedback-v7.test.mjs` — regression tests for sample fields, narrative, review reveal.
