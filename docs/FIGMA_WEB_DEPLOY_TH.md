# TutorPair Figma — เว็บไซต์พร้อมทดลอง / วิธี Deploy

## ทำไมไฟล์ชุดนี้เหมือน Figma ล่าสุด

ต้นฉบับ ZIP ใช้ React/Vite สำหรับแสดงหน้าหลัก แต่หน้า Dashboard ที่กดใช้งานอยู่ใน `public/` เป็น HTML/CSS/JavaScript อยู่แล้ว ชุดนี้คัดลอก `public/` เป็น `frontend/` และเพิ่ม `frontend/index.html` เพื่อเรียก `assets/js/home.js` ของ Figma เดิมโดยตรง **ไม่ได้ออกแบบหน้าใหม่**

## เปิดบนเครื่อง Windows

```cmd
cd /d C:\Users\Aim\Downloads\TutorPair_Figma_Website_Ready\frontend
py -m http.server 5500
```

เข้า `http://127.0.0.1:5500/` หรือ `http://127.0.0.1:5500/login.html`

*ต้องเป็น `http://` ไม่ใช่ `https://` สำหรับ Python HTTP Server*

## Checklist ตรวจเว็บ

1. Landing page โหลดรูปและ CSS ตาม Figma
2. Login → Explore sample accounts → Student / Tutor / Parent / Admin
3. Tutor Dashboard → Student Requests (ไม่เป็นหน้าขาว)
4. Student เลือก Tutor → Tutor Accept → แก้แผน → Student Request Changes พร้อม Comment → Tutor ส่งใหม่ → Student Approves
5. Tutor Verification → ส่งหลักฐานตัวอย่าง → Admin Review (ใน Browser เดียวกัน)
6. Sidebar badge / Notification Bell ตามโค้ด Figma ที่ส่งมา
7. BYOS Invite จากบัญชีติวเตอร์และ Student Join ภายใน Browser เดียวกัน

## Deploy กับ Netlify

1. Push ไฟล์ชุดนี้ขึ้น GitHub ในโครงสร้าง `frontend/` ที่ root ของ Repository
2. Netlify → Add new project → Import an existing project → GitHub
3. เลือก Repo และ Branch
4. Build command: เว้นว่าง
5. Publish directory: `frontend`
6. Deploy

ไฟล์ `netlify.toml` ตั้งค่า Publish Directory ให้แล้ว สามารถใช้ค่าจากไฟล์ได้เลย

## ข้อจำกัดที่ต้องแยกจากเว็บใช้งานจริง

- **Website ใช้ได้ผ่าน URL** แต่บัญชีและข้อมูลไม่ซิงก์ระหว่างเครื่อง
- Login และ Admin Approval เป็นการจำลอง ไม่ใช่การตรวจสิทธิ์บน Server
- PDF/Video Preview อาจแสดงเฉพาะ Browser ที่อัปโหลดไฟล์ ไม่มีระบบไฟล์กลาง
- BYOS Invite ยังไม่ใช่ลิงก์ข้ามเครื่องจริง
- LINE, PromptPay, AI Worksheet และ Notification ข้ามเครื่อง ยังไม่ได้เชื่อมจริง
- ห้ามใช้รหัสผ่านจริงหรือเอกสารผู้ใช้จริงทดลอง Demo
