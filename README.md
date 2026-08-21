# NASSER PDF

أداة شخصية مجانية لتحويل الملفات إلى PDF وإنشاء رموز QR، بدون تسجيل دخول أو لوحة تحكم.

## الأدوات

| الأداة | أين تعمل |
| --- | --- |
| Word (DOC/DOCX) → PDF | خادم Backend (LibreOffice) |
| Excel (XLS/XLSX) → PDF | خادم Backend (LibreOffice) |
| صور (PNG/JPG) → PDF | داخل المتصفح بالكامل (pdf-lib) |
| QR Code | داخل المتصفح بالكامل (qrcode) |

## البنية

```
frontend/   React + Vite — يُنشر على Vercel
backend/    Express + LibreOffice (Docker) — يُنشر على Render
render.yaml Render Blueprint لنشر الـ backend تلقائياً
```

تحويل Word وExcel يحتاج محرك LibreOffice حقيقي لإنتاج PDF مطابق للتنسيق الأصلي،
وهو ما لا يمكن تشغيله على Vercel Serverless — لذلك يُشغَّل في حاوية Docker منفصلة على Render.
أدوات الصور وQR Code لا تحتاج أي خادم إطلاقاً وتعمل مجاناً بدون أي حدود استخدام.

## التشغيل محلياً

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend (يحتاج LibreOffice مثبت محلياً أو Docker)

```bash
cd backend
docker build -t nasser-pdf-backend .
docker run -p 3000:3000 -e ALLOWED_ORIGINS=http://localhost:5173 nasser-pdf-backend
```

ثم أنشئ ملف `frontend/.env.local` وضع فيه:

```
VITE_API_URL=http://localhost:3000
```

## النشر

### 1) Backend على Render

- من لوحة Render: **New → Blueprint**، واختر هذا الريبو (يقرأ `render.yaml` تلقائياً).
- أو يدوياً: **New → Web Service** → اختر الريبو → Runtime: `Docker` → Root Directory: `backend`.
- الخطة: `Free`.
- بعد أول نشر، عدّل متغير البيئة `ALLOWED_ORIGINS` ليطابق رابط موقعك على Vercel.
- ملاحظة: الخطة المجانية على Render "تنام" بعد فترة من عدم الاستخدام، فأول طلب تحويل بعد فترة خمول
  قد يستغرق 30-50 ثانية إضافية لتشغيل الحاوية من جديد. هذا طبيعي ولا يحتاج أي إجراء.

### 2) Frontend على Vercel

- **New Project** → اختر الريبو → Root Directory: `frontend`.
- Framework Preset: `Vite` (يُكتشف تلقائياً).
- أضف متغير البيئة `VITE_API_URL` بقيمة رابط خدمة Render (مثال: `https://nasser-pdf-backend.onrender.com`).
- Deploy.

### 3) بعد النشر

- تأكد أن `ALLOWED_ORIGINS` في Render يطابق دومين Vercel الفعلي (بدون شرطة `/` في النهاية).
- اربط دومين مخصص من إعدادات Vercel إن رغبت.

## الأمان والحماية

- Rate limiting على `/api/convert` (30 طلب لكل 15 دقيقة لكل IP).
- التحقق من امتداد الملف وحجمه (حتى 15MB) قبل المعالجة.
- CORS مقيّد بدومين الواجهة الأمامية فقط.
- كل ملف يُحوَّل في مجلد مؤقت معزول يُحذف فوراً بعد الاستجابة (نجاحاً أو فشلاً).

## يحتاج إضافة يدوياً

- صورة `frontend/public/og-image.png` (1200×630) لمعاينة المشاركة على وسائل التواصل.
- دومين مخصص إن توفر.
