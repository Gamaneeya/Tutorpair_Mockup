# TutorPair prototype data flow

## Editing the mock data

```text
assets/data/mock-data.js
          ↓
assets/js/data-source.js   (getData(), updateData())
          ↓
assets/js/main.js          (initializes data)
          ↓
assets/js/app.js           (renders all role-specific pages)
          ↓
45 small HTML route files
```

### Demo interactions that share data

**Tutor session notes**
1. Tutor opens `/tutor/session-notes.html`.
2. Form is prefilled from `latestNote`.
3. Tutor edits topic, quiz score and learning feedback.
4. On Save, `updateData()` saves `latestNote`, `lessonNotes`, `student.latestQuiz` and a notification preview to `localStorage`.
5. Parent Dashboard and Parent Progress read the same updated data object after switching demo roles.
6. This does **not** contact LINE or a real parent.

**Group filling**
1. Tutor opens `/tutor/group-seats.html`.
2. Group capacity, BYOS and platform seats are read from `groupClasses`.
3. Clicking Fill Seat increments `platform` by 1 if capacity permits.
4. `/student/matching.html` can recommend eligible classes by matching subject/grade and checking that a seat remains.

**Student matching**
1. Student submits a request to browser `localStorage`.
2. Tutor view filters sample tutors by subject/grade/budget/schedule.
3. Group view filters sample classes by subject/grade/free seats/budget/schedule. Group package price is divided by the illustrative eight sessions to compare against an hourly budget; this is only a mock assumption.
4. This is a simple mock filter, **not the final compatibility ranking engine**. It deliberately shows fewer than 3 options when only fewer qualify.

**LINE settings**
- Connected status and preferences change only local mock data.
- Notifications are mock status entries. No verified LINE accounts exist.

### Browser data and reset

`localStorage` keys used:
- `tutorpair_demo_v2` — edited sample records
- `tp_demo_account` — chosen demo role
- `tp_learning_request` — latest student request
- `tp_student_feedback` — example feedback

Reset sample data removes the first two keys and returns to the landing page. The request and feedback keys are cleared on full reset in production-oriented code revisions; you can clear the browser's site data to reset everything.
