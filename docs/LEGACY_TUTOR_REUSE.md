# Tutor MVP — What was reused from the legacy 2025 project

Source reviewed (not copied wholesale):
- `src/components/TutorRegistrationForm.tsx`
- `src/components/StudentRegistrationForm.tsx`
- `src/components/AddSubjectDialog.tsx`
- `src/components/TutorDashboard.tsx`

## 1. Nine paired slider axes (reused with aligned definitions)

The old Tutor Registration and Student Registration used five teaching/learning sliders and four personality/interaction sliders. The fresh `frontend/assets/js/preferences.js` stores one shared nine-axis definition (left=1, right=5). The same control appears in student learning requests and tutor onboarding. The example catalog includes corresponding numeric tutor vectors. The matching engine now uses normalized absolute distance between the two vectors for teaching-preference fit. The nine axes are a compatibility heuristic, **not a validated learning-styles model or causal predictor of better grades**.

## 2. Add Subject / Course (reworked)

`AddSubjectDialog.tsx` inspired the new `tutor/subjects.html` five-step offering wizard:
1. Category
2. Specific subject
3. Academic goal
4. Course focus
5. Grades, topics, hourly rate, session formats and time slots

The fields are saved in `tutor.offerings` and mirrored into a `catalog.tutors` offering. The deterministic engine now assesses individual offerings and selects the highest-scoring eligible offering **per tutor**, eliminating duplicated tutor cards. New academic offerings reset the new tutor's demo verification status to Draft; an unapproved tutor is filtered out of Top-3.

## 3. TutorDashboard course outline (reworked)

The legacy `TutorDashboard.tsx` managed student-specific learning objectives with completed/not completed checkboxes. The new `tutor/students.html` supports creating, toggling and removing objectives in a shared `learningPlans[studentId]` store. Returning Tutor has a sample plan; newly accepted learners receive a starter plan from requested topics. For the linked demo student, Student and Parent Progress read this same plan. **Objective completion is not subject mastery or quiz accuracy.**

## 4. Kept from latest TutorPair concept

- New Tutor starts with 0 learners, 0 lessons, ฿0 earnings.
- Demo admin verification is required before new tutors enter Matching.
- Tutors can invite existing learners through the simulated BYOS group-creation flow and fill vacant seats.
- Tutor session notes feed Student and authorized demo Parent pages.
- Online-only M.1–M.6 school-grade support.
- LINE Flex Message and LIFF are previews; no actual message is sent.

## 5. Data-source ownership

The **sample** records live in `frontend/assets/data/mock-data.js`. The role-specific pages are shells. UI components use shared JS modules. To connect real user data, a server-side authenticated API and role-scoped access checks will be required; replacing mock data alone does not constitute production readiness.
