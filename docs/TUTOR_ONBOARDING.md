# Tutor verification policy proposed for the MVP

**Initial screening, once per tutor**

1. Create public tutor profile and select initial subject/grades.
2. Submit identity, academic and short teaching-demo evidence through a future secure process. This frontend only collects simulated evidence categories, not files.
3. Admin approves tutor identity / readiness and the initial subject/grade scope.
4. Tutor can then publish and edit 1-on-1 offerings and small groups freely **within already-approved subject/grades**.

**Subsequent changes**

- Price or schedule change: immediately permitted; does not reset verification.
- New course in an approved subject/grade: permitted immediately.
- New subject/grade outside the approved scope: a **new scope request** is Pending until Admin approves *only that request*.
- Existing approved subject/grade listings remain active while that request is pending.
- Identity/qualification evidence changes would be subject to separate review in a real service, not editable in this demo after approval.
- New group creation requires an approved subject/grade and group teaching format enabled.

The code stores the tutor-level check in `tutor.verificationStatus`, scope checks in `tutor.subjectApprovals` and `catalog.tutors[*].approvedScopes`, and published 1-on-1 listings in `tutor.offerings` / `catalog.tutors[*].offerings`. `approvedToTeach()` checks both identity and scope before matching.
