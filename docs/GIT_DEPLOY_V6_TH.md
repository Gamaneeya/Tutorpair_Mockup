# วิธีเอา TutorPair V6 ขึ้น GitHub / เปิด Demo

Repository เดิม: https://github.com/Gamaneeya/Tutorpair_Mockup

## วิธีอัปเดต Git อย่างปลอดภัย (Windows CMD)

1. แตก `TutorPair_Feedback_V6.zip` ใน `C:\Users\Aim\Downloads`
2. เข้า Repository เดิมที่มี `.git`: `cd /d C:\Users\Aim\Downloads\TutorPair_Latest`
3. เช็กว่าทำงานค้างไหม `git status` ถ้า clean ให้ใช้ `git pull --rebase origin main`
4. คัดลอกเวอร์ชัน V6 ไปที่ Repo (คำสั่งจากที่ใดก็ได้):

```cmd
robocopy "C:\Users\Aim\Downloads\TutorPair_Feedback_V6" "C:\Users\Aim\Downloads\TutorPair_Latest" /E /XD .git node_modules
```

5. กลับไปที่ Repository แล้วตรวจ:

```cmd
cd /d C:\Users\Aim\Downloads\TutorPair_Latest
git status
git add -A
git -c core.pager=cat diff --cached --stat
```

ตรวจไม่ให้มีไฟล์ของเพื่อนถูกลบ/ทับโดยไม่ตั้งใจ จากนั้น:

```cmd
git commit -m "Apply TutorPair V6 feedback to tutor student and post-match flows"
git push origin main
```

ถ้าเจอ Conflict ให้หยุดก่อน ไม่ใช้ `git push --force` (และไม่ใช้ `git init` ในโฟลเดอร์ ZIP)

## เปิด Demo ในเครื่อง

```cmd
cd /d C:\Users\Aim\Downloads\TutorPair_Latest\frontend
py -m http.server 5500
```

เปิด http://localhost:5500/login.html

## ขึ้น Website

- **Netlify**: Repo มี `netlify.toml` สำหรับ Publish โฟลเดอร์ `frontend` เป็น Website Root. เชื่อม GitHub Repo ผ่าน Netlify แล้วเลือก Deploy, หรือ Drag & Drop เนื้อหาของโฟลเดอร์ `frontend` (ไม่ต้องใช้ Build Command)
- **GitHub Pages (Project URL)**: V6 ยังคงใช้ URL ที่เริ่มจาก `/` ใน HTML/JS เหมือน V5 จึง **ไม่รองรับการ Deploy ตรงใต้ Subpath `/Tutorpair_Mockup/` โดยไม่ปรับ Base Path เพิ่ม** อย่าอ้างว่า GitHub Pages พร้อมใช้งาน
- Frontend Demo บนเว็บสาธารณะไม่ใช่ Production App: Login/Verification/LINE/Payment/Document Upload เป็นการจำลอง ไม่เหมาะกับข้อมูลจริง
- BYOS Link ยังไม่สามารถใช้งานข้ามเครื่องบน Hosting แบบ Static ได้
