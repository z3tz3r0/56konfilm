# เปิดใช้งานอีเมลจาก Contact Us

ระบบส่งอีเมลปิดไว้ด้วย `CONTACT_EMAIL_ENABLED=false` จนกว่าจะตั้งค่า Resend และ Cloudflare Turnstile ครบ ขั้นตอนนี้ทำภายหลังได้โดยไม่ต้องเปลี่ยนโค้ดส่งอีเมล ผู้กรอกฟอร์มทั้ง Production และ Wedding จะส่งถึงอีเมลเจ้าของเว็บหนึ่งที่อยู่ โดยใช้อีเมลผู้กรอกเป็น Reply-To

## เตรียมบัญชีและโดเมน

1. ซื้อโดเมนสำหรับเว็บไซต์ เช่น `56konfilm.com` แล้วให้เจ้าของเว็บสมัคร Resend และ Cloudflare Turnstile ด้วยบัญชีที่ตนดูแล
2. ใน Resend เพิ่มโดเมนสำหรับส่งอีเมล และตั้ง DNS records ที่ Resend ระบุ รอให้สถานะโดเมนเป็น Verified จากนั้นสร้าง API key อีเมลผู้ส่งอย่าง `contact@56konfilm.com` ต้องอยู่บนโดเมนที่ยืนยันแล้ว ส่วน **อีเมลผู้รับเป็น Gmail ส่วนตัวได้** ไม่ต้องซื้อ Google Workspace
3. ใน Cloudflare Turnstile สร้าง widget สำหรับ hostname จริงของเว็บไซต์ เก็บ Site Key และ Secret Key แยกกัน Site Key แสดงใน browser ได้ ส่วน Secret Key ต้องอยู่ฝั่ง server เท่านั้น

## ตั้งค่าบน Vercel

เพิ่ม environment variables ตาม `.env.example` ใน deployment ที่ต้องการใช้งาน:

| ตัวแปร                           | ค่า                                                          |
| -------------------------------- | ------------------------------------------------------------ |
| `CONTACT_EMAIL_ENABLED`          | `false` ระหว่างเตรียม; เปลี่ยนเป็น `true` หลังตรวจครบ        |
| `RESEND_API_KEY`                 | API key จาก Resend                                           |
| `CONTACT_EMAIL_FROM`             | อีเมลผู้ส่งบนโดเมนที่ยืนยันแล้ว เช่น `contact@56konfilm.com` |
| `CONTACT_EMAIL_TO`               | อีเมลเจ้าของเว็บที่ต้องการรับข้อความ ใช้ Gmail ส่วนตัวได้    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site Key ของ widget สำหรับ hostname นี้                      |
| `TURNSTILE_SECRET_KEY`           | Secret Key ของ widget เดียวกัน                               |

เมื่อเปิด `CONTACT_EMAIL_ENABLED=true` แอปจะตรวจค่าทั้งชุดตั้งแต่เริ่มทำงานและระหว่าง build ถ้าขาดหรือผิดรูปแบบจะหยุดด้วย error แทนการเปิดฟอร์มที่ส่งไม่ได้ Build ที่ใช้ `NODE_ENV=production` รวมถึง Vercel Preview จะไม่รับ [Turnstile test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) ใช้ test keys ได้ในการทดสอบ local development หรือ unit tests และต้องใช้ Site Key กับ Secret Key ที่เข้าคู่กัน หากทดสอบบน Preview ที่เปิดส่ง ให้สร้าง widget และใช้ keys จริงสำหรับ hostname ของ Preview

`RESEND_API_KEY`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` และ `TURNSTILE_SECRET_KEY` ยังเป็น `.optional()` ใน schema เพื่อให้ระบบที่ปิดการส่งอีเมล build และ rollback ได้โดยไม่ต้องมีบัญชีบริการ เมื่อเปิดส่ง ค่าทั้งห้าจะถูกบังคับโดยการตรวจแบบ fail-fast อยู่แล้ว หลังเจ้าของเว็บสมัครและตั้งค่าบริการครบ **ยังไม่ต้องถอด `.optional()`**; ให้พิจารณาเปลี่ยนเป็น required เฉพาะเมื่อเลิกใช้ `CONTACT_EMAIL_ENABLED=false` และตั้งใจให้การส่งอีเมลเปิดถาวรเท่านั้น

ตรวจโควตาและเงื่อนไขค่าใช้จ่ายของ Resend, Vercel และ Turnstile ในวันที่เปิดใช้งานจริง ตั้งค่าการแจ้งเตือนหรือมาตรการควบคุมค่าใช้จ่ายตามที่แต่ละบริการมีให้ ก่อนเปิดสวิตช์ให้ลองบนสภาพแวดล้อมทดสอบที่ตั้งค่าครบ แล้วตรวจทั้ง Production และ Wedding: ข้อความส่งถึงผู้รับ, Reply-To เป็นอีเมลผู้กรอก, Wedding Date ตรงกับวันที่เลือก, token ที่ใช้ซ้ำหรือหมดอายุถูกปฏิเสธ และเมื่อส่งไม่สำเร็จข้อมูลในฟอร์มยังอยู่ หลังจากนั้นเปิด `CONTACT_EMAIL_ENABLED=true` บน production แล้วทดลองส่งจริงทั้งสองโหมดอีกครั้ง

หากพบปัญหา ให้เปลี่ยน `CONTACT_EMAIL_ENABLED=false` บน Vercel แล้ว redeploy ฟอร์มจะปิดการส่งและแสดงช่องทางติดต่อเดิม ตรวจ logs โดยไม่เปิดเผย API key หรือข้อมูลส่วนตัวก่อนแก้ไขและเปิดใหม่

## ข้อจำกัดและเมื่อควรยกระดับการป้องกัน

ฟอร์มตรวจ Turnstile token ผ่าน Cloudflare Siteverify บน server ก่อนส่งอีเมล Token มีอายุ 5 นาทีและใช้ได้ครั้งเดียว เมื่อการตรวจไม่ผ่านหรือบริการขัดข้อง ฟอร์มจะขอ token ใหม่และไม่ส่งอีเมล

ตัวจำกัดความถี่นี้เป็นมาตรการชั่วคราว: สูงสุด 5 ครั้งใน 2 นาทีต่อ IP **ต่อ Vercel Function instance** ตัวนับอยู่ใน RAM และไม่แชร์กัน จึงไม่รับประกันว่าจะจำกัด IP เดียวได้ครบทุกครั้งหรือป้องกันสแปมได้ 100% หากไม่มี IP ที่เชื่อถือได้ ระบบจะข้ามเฉพาะตัวนับ แต่ยังบังคับ Turnstile หากพบ bot ยิงฟอร์มจริงหรือโควตาอีเมลถูกใช้ผิดปกติ ให้พิจารณา [Vercel WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) และตรวจเงื่อนไขกับค่าใช้จ่ายล่าสุดก่อนเปิดใช้

ตัวนับอ่าน IP จาก `x-vercel-forwarded-for` เมื่อ Vercel เปิดเผย system environment variable `VERCEL=1` หากปิดการเปิดเผย system variables นี้ ตัวนับจะข้ามไป ให้ตรวจตัวเลือก Automatically expose System Environment Variables ใน Project Settings ของ Vercel ก่อนเปิดส่งจริง

เอกสารอ้างอิง: [Resend ส่งอีเมล](https://resend.com/docs/send-with-nodejs), [Cloudflare Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Vercel Function instances](https://vercel.com/docs/functions)
