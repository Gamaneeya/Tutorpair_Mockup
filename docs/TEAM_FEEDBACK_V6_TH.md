# TutorPair V6 — สรุปการแก้ตาม Feedback ของทีม

**เป้าหมาย:** สาธิตเส้นทาง Tutor → Student Match → 4-Session Plan → Progress → Parent และรักษา BYOS จาก V5 โดยไม่แสดงว่าระบบที่ยังไม่มี Backend ทำงานจริง

## รายการที่แก้ใน Interactive MVP

| ข้อเสนอ | สิ่งที่ทำใน V6 | ข้อจำกัด |
|---|---|---|
| Tutor availability | เลือก Mon–Sun พร้อม Start/End time แยกตามวัน | เป็น Recurring Weekly Availability ไม่ใช่ Calendar ที่ตรวจวันหยุดจริง |
| Tutor hourly rate | กรอกราคาเริ่มต้น ฿100/ชม. | เป็น Rate ตัวอย่าง ไม่มีการเรียกเก็บเงินจริง |
| Subject evidence | ช่องเลือก PDF/รูปหลักฐานวิชา | จำเฉพาะชื่อไฟล์ ไม่มี upload หรือ Verify จริง |
| 3-minute teaching demo | เลือกวิดีโอเพื่อเปิด Preview ในหน้า Verification หรือกรอก HTTPS URL | ไฟล์ไม่ถูกเก็บข้าม Refresh; บน Match Card แสดง Video เฉพาะ URL ที่มีจริง |
| Student 4-session packages | Regular (4×1/wk), Sprint (2×2/wk), Cram (1×4/wk), เลือกคาบ 60/90/120 นาที | Package เป็นตัวเลือกเป้าหมาย การยืนยันเวลาและชำระเงินยังเป็น Demo |
| Student availability | เลือก Mon–Sun พร้อมเวลา, Matching ใช้เวลาซ้อนกันตามความยาวคาบและจำนวนวัน/สัปดาห์ | ยังไม่จองช่วงเวลาจริง ไม่ตรวจปฏิทินวันหยุด/คาบชนกัน |
| Budget calculator | แสดง Maximum Budget = Hourly Ceiling × Total Hours | Match Cards แสดงราคาจริงจากอัตรา Tutor; ไม่ใส่ fee ที่ยังไม่กำหนด |
| Match Cards | เพิ่ม profile detail, Why Matched, คอร์ส 4 คาบ/ราคา, Video ถ้ามี, baseline 4-Lesson Roadmap | ไม่แต่ง GPA/Rating/Verified Hours/Renewal Rate ถ้าไม่มีข้อมูลจริง |
| Draft lesson plan | สร้าง Baseline 4 หัวข้อเหมือนกันสำหรับทุก Tutor และเปิด Tutor Role-play ปรับหัวข้อก่อน Student Approve | เป็น Rules-based Sample ไม่ได้ OCR/AI วิเคราะห์ Worksheet |
| Tutor accept in 24h | สถานะ Pending → Simulate Tutor Accept/Reject | ไม่ใช่ 24-hour timeout จริง ไม่มี Notification |
| Payment | หน้ายืนยันหลังอนุมัติแผนก่อน Simulate Checkout | ไม่ใช่ PromptPay Escrow จริง |
| Session progress | 4-step roadmap แสดง Done / In Progress / Upcoming | สถานะ Demo, ไม่มี attendance verification |
| Reschedule / Cancel | Student ส่งคำขอ; Simulate Tutor Accept / Reject | ไม่ enforce กฎล่วงหน้า 24 ชม. เพราะไม่มี Lesson Datetime จริง |
| Student evaluation | Clarity 3 faces + Pace; ตัด Quiz Score ออกจากฟอร์ม | เก็บเฉพาะใน Browser |
| Tutor evaluation | Engagement 1–3, Homework, Short Notes, annotated PDF filename | ไม่ upload PDF จริง ไม่ส่ง LINE จริง |
| Parent monthly evaluation | Progress 1–5 + Continue? yes/maybe/no | Demo แยกบัญชีไม่ sync ข้ามเครื่อง |
| Public review | มี private draft หลังเรียนครบ 4 คาบ | ยังไม่มีระบบเปิดเผยเมื่อ 2 ฝ่ายส่ง/ครบ 14 วัน |
| Demo toggle | Sample Mode New/Active Student/Tutor ใน Navbar ของ Demo | เปลี่ยน Sample จะ Reset Demo Story ไม่กระทบบัญชีที่ Register |
| BYOS | เชิญนักเรียน กลุ่มที่นั่ง ใช้บัญชี Student เดียวกับ Matching ต่อ | **ยังใช้ได้เฉพาะ Registered Tutor & Student ใน Browser/Origin เดียวกัน**; ส่ง link ข้ามเครื่องต้องใช้ Backend/Database |

## Demo Flow แนะนำสำหรับเพื่อน

### Student (New)

1. Login → Explore sample accounts → **New Student**
2. Learning Request → Grade/Subject/Goal → 3 Preferences → เลือก Regular / Sprint / Cram + 60/90/120 นาที + Weekly Schedule + Budget
3. ดูราคางบสูงสุดทางขวา → Find Top 3 → ดูราคา Tutor จริง, Why Matched และ Baseline 4-Lesson Roadmap
4. View Details → Request Lesson → Simulate Tutor Accept → Edit Plan as Tutor (demo) → Approve as Student/Parent (demo) → Mock Checkout
5. Student Dashboard → My Classes → Progress → Session Roadmap / Feedback / Request Reschedule

### Tutor (New)

1. Register Tutor → Profile → Availability Mon–Sun + Rate อย่างน้อย ฿100/hr
2. Verification → Box 1 Sample Subject Evidence / Box 2 Video File หรือ URL → Submit → Simulate Admin Approval
3. Teaching Subjects → Publish a course in an approved scope; ไม่ต้องรอ Verify ซ้ำ
4. Small Groups → Create Group → Invite Students (BYOS)
5. Session Notes → Engagement / Homework / Short Note / Sample PDF Filename; ไม่มี Quiz Score

### Active Demo & Parent

1. Login → Explore sample accounts → Active Student หรือ Active Tutor (มี 3 คลาสตัวอย่าง)
2. Student → Progress → ดู roadmap และส่ง private after-session evaluation
3. Demo view → Parent → Link (sample) → Progress → Monthly Feedback และ LINE Preview

### BYOS

1. Same-browser Demo Tutor ที่ Register จริง → Approve Simulation → Create Small Group → Invite Students → Generate Link
2. Log out → เปิดลิงก์ **ใน browser เดิม** → Register/Login Student → Accept Invite
3. My Classes → Find Another Tutor → Physics → Matching → เพิ่มคลาสที่ 2 บัญชีเดิม

## Backend ต่อไป: เพื่อให้ BYOS และ Post-match เป็นของจริง

- Authentication, authorization, Tutor Approval และ Database
- Class Invitation Tokens: expiry/revocation, owner check, capacity lock, enrollment uniqueness, source=BYOS server-side
- Course Request state machine + tutor acceptance/expiration + edited Lesson Plan + authorized parent approval
- Scheduled lessons with time-zone-aware datetime, reschedule rules, attendance, refunds
- Payment provider + real escrow/release rules (อย่าใช้แค่ป้ายคำว่า escrow)
- Tutor–Student–Parent session reports, consent/permissions, file storage for GoodNotes PDFs
- LINE OA + LIFF Login + Messaging API (Server-side token only), delivery dedup/retries
- Private evaluations and guarded publish rules for public reviews
- Worksheets: secure upload, consent, content processing, AI explanation (only after available)

**ข้อควรระวัง:** ห้ามใช้รหัสผ่านจริง เอกสารแสดงตัวตนจริง หรือข้อมูลเด็กจริงกับ Browser-only Demo
