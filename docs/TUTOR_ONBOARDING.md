# First-time tutor onboarding and state transitions

```text
Register as Tutor
      ↓
Empty Tutor Dashboard (0 students, 0 lessons, ฿0 earnings)
      ↓
Teaching Profile (subject, grade, topics, pace, teaching method, fees, schedule)
      ↓
Verification Application (mock credentials + teaching demo readiness)
      ↓
Pending Verification (unavailable for Top 3 matching)
      ↓
Admin Approval (simulated)
      ↓
Verified Tutor with 0 Students
      ├── Open 1-on-1 → accept qualified request → Active Tutor
      └── Create Group + BYOS students → active tutor with open seats
                                              ↓
                               TutorPair fills seats by matching
                                              ↓
                               Teach → Session Notes → Parent Progress
```

### Important business and safety decisions

- Profile data and student answers use shared matching attributes; choose terms carefully for reliable computation, not pseudoscientific learning styles.
- Verification should be independent of self-declared tutor profile data. Real identity/degree checks should happen through secured backend tools and human review. A proposed subject assessment and five-minute demo can supplement academic documents.
- While the tutor is awaiting review, no private student requests should be disclosed and the tutor must not be ranked as verified.
- Source attribution should be recorded on enrollment: **BYOS vs TutorPair-sourced**. BYOS receives proposed 0% marketplace commission; payment processing is a separate cost.
- Group creation is available only when approved and group format is enabled. Demo group students can be initialized as BYOS for the group-filling use case.
- A group with zero students is *published/open*, not an actively teaching tutor; the first learner makes the tutor dashboard active.
- Parent-facing lesson notes should be published only to verified linked parents of the learner concerned, with student/parent consent and secure authorization in the real app.

### Suggested slide / demo script (Tutor, 45 seconds)

> "New tutors don't start with a fake revenue dashboard. They first declare the subjects, grades and teaching attributes that our matching algorithm uses. The tutor then submits for screening, and only an approved tutor enters the marketplace. Once approved, they can take a 1-on-1 student or bring two students into a small group and let TutorPair fill the empty seats. The dashboard becomes active as teaching activity starts."

For a short 3-minute MVP demo, show Student matching + Tutor notes + Parent progress. Keep the full New Tutor verification and BYOS group flow as a backup or a screenshot in the pitch deck.
