# Practice Pitch — Demo checklist (3 minutes)

This is a **prototype**, not production. All interactions are local; no credit cards, private IDs, LINE messages or accounts are exchanged.

## Main walkthrough (~3 minutes)

**0:00–0:50 · Student matching**
1. Landing → Start demo → New Student (blank dashboard).
2. Learning Request: M.4 Mathematics; school-grade improvement; Algebra/Functions; 9 preferences; weekday/saturday availability; ฿500/hour.
3. Continue → simulated loading ~1 sec → eligible Top 3. Explain weights and that changing budget/preference can change ranking.

**0:50–1:40 · Tutor onboarding (prepare admin verification ahead of time)**
1. Login → New Tutor (zero students, zero revenue).
2. Tutor Profile → show professional info, subject/grade/goal and matching sliders.
3. Teaching Subjects → five-step editor and initial subject offer.
4. Verification → status Pending. Admin demo approval needed before profile appears in recommendations.

**1:40–2:25 · Active Tutor**
1. Login → Returning Tutor (pre-filled sample roster), navigate My Students & Learning Plans.
2. Tick an objective. Open Small Groups to show BYOS seats and fill an open seat.
3. Session Notes: save a quiz score and next task.

**2:25–3:00 · Parent**
1. Switch via Demo view → Parent; if returning dataset was used, the linked student is already connected.
2. Parent Progress shows shared learning plan and tutor's lesson note.
3. LINE Preferences shows only a Flex-style preview; LIFF/API integration is planned.

Important: Selecting a New or Returning scenario from the public login **resets the local demo dataset**. For a connected cross-role demo, start the Returning scenario once and use the **Demo view** dropdown in the app header to switch roles without resetting data. For a new tutor journey, stay in one New scenario and switch roles from the app header when approving it.

## What is real inside the prototype
- Native HTML pages and interactive JS forms
- Shared numerical slider scales on both sides
- Real deterministic hard filters and weighted scoring over sample tutor profiles
- Add/remove tutor offerings saved to localStorage
- Sample admin approval gate before new tutors enter Matching
- Group seats and learning-plan objectives updated locally
- Session notes are propagated across the shared demo scenario

## What is mock/planned
- Authentication and actual ID/degree verification
- Actual human screening
- Real database and payment processing
- Real chat/video lesson
- AI-powered text generation and worksheet interpretation
- LINE OA / Flex Message delivery and LIFF
- Parent consent/identity confirmation
