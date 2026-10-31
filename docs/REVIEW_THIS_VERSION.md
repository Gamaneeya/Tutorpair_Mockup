# What to review — TutorPair MVP V3

The **latest agreed rules** are intentionally different from the previous prototype.

## Student Form
- [ ] Has grade, subject, academic goal, optional current/target grade, baseline level.
- [ ] **Does not ask students to select Specific Topics**.
- [ ] Offers **exactly three** quick preference questions, not nine sliders.
- [ ] Has format, budget and day/time preferences.
- [ ] Shows a short loading view and ranks **up to** three eligible results.
- [ ] Changes in goal, preferences, budget or schedule affect real sample ranking/filtering.

## New Tutor
- [ ] Empty Dashboard before creating a profile.
- [ ] Onboarding three steps: identity/background; first subject/grade, price and schedule; three compatible teaching preference questions.
- [ ] Submits initial verification (simulated only); not shown publicly until Admin approval.
- [ ] Admin approves initial identity/readiness and initial subject/grade scope.
- [ ] Tutor publishes Mathematics/M.4 courses immediately afterward, without another approval.
- [ ] Tutor can edit rate and schedule of that course immediately.
- [ ] Tutor requests Physics/M.4: **Pending**; existing Math class remains published and eligible for matching.
- [ ] Admin approves the new Physics scope independently.
- [ ] Physics can now be used for a course, without repeating identity verification.

## Returning Tutor / Parent
- [ ] Existing student list and plan percentages work.
- [ ] Small groups can be published only for approved subjects/grades; BYOS and seat-filling sample remains.
- [ ] Session notes update the linked Parent Progress view.
- [ ] LINE OA / LIFF is shown **only as a preview**.

## Demo limitations that must be disclosed
- This prototype uses `localStorage` and hardcoded fictional identities/tuition prices.
- Admin approval is a simulated state, not legal identity verification.
- There is no secured backend, real payment, tutoring session, or LINE integration.
- The matching formula is rule-based, not LLM-generated, and 3 preference questions are not scientifically validated learning styles.
- Initial verification and subject approval rules are suggested product policies, not compliance certification.

## Important UX note
The first tutor's profile asks for a first approved **subject/grade range**. On the Teaching subjects page, creating a **course** uses that approved range, while requesting a **new subject/extra grade** is a distinct action and does not suspend previously approved courses.
