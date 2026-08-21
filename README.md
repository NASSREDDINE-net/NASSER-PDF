# NASSER PDF

أداة شخصية مجانية لتحويل الملفات إلى PDF وإنشاء رموز QR، بدون تسجيل دخول أو لوحة تحكم.

## الأدوات

| الأداة | أين تعمل |
| --- | --- |
| Word (DOC/DOCX) → PDF | Vercel Serverless Function تستدعي CloudConvert |
| Excel (XLS/XLSX) → PDF | Vercel Serverless Function تستدعي CloudConvert |
| صور (PNG/JPG) → PDF | داخل المتصفح بالكامل (pdf-lib) |
| QR Code | داخل المتصفح بالكامل (qrcode) |

## البنية

```
frontend/           React + Vite — يُنشر على Vercel
frontend/api/convert.js   Serverless Function تستدعي CloudConvert API لتحويل Word/Excel إلى PDF
```

مشروع واحد فقط على Vercel — لا حاجة لأي خادم منفصل. تحويل Word وExcel يتم عبر خدمة
[CloudConvert](https://cloudconvert.com) الخارجية (تحويل حقيقي مطابق للتنسيق الأصلي)، ويُستدعى
من دالة Serverless تعمل داخل نفس مشروع Vercel وتُخفي مفتاح الـ API عن المتصفح.
أدوات الصور وQR Code لا تحتاج أي خادم إطلاقاً وتعمل مجاناً بدون أي حدود استخدام.

## التشغيل محلياً

```bash
cd frontend
npm install
npm run dev
```

أدوات الصور وQR Code تعمل مباشرة مع `npm run dev`. لاختبار Word/Excel → PDF محلياً تحتاج
[Vercel CLI](https://vercel.com/docs/cli) لتشغيل الـ Serverless Function:

```bash
npm i -g vercel
cd frontend
vercel dev
```

ثم أنشئ ملف `frontend/.env.local` وضع فيه مفتاح CloudConvert (انظر `.env.example`):

```
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key_here
```

## النشر على Vercel

1. **New Project** → اختر الريبو → **Root Directory: `frontend`**.
2. Framework Preset: `Vite` (يُكتشف تلقائياً).
3. أضف متغير البيئة (Settings → Environment Variables):
   - Key: `CLOUDCONVERT_API_KEY`
   - Value: مفتاحك من [cloudconvert.com/dashboard/api/v2/keys](https://cloudconvert.com/dashboard/api/v2/keys)
   - **بدون** بادئة `VITE_` — هذا مهم حتى لا يظهر المفتاح في كود المتصفح.
4. Deploy.

## حدود CloudConvert المجانية

الخطة المجانية من CloudConvert توفر عدد محدود من دقائق التحويل يومياً — كافية للاستخدام
الشخصي، لكن لو تجاوزت الحد ستحصل على رسالة خطأ من `/api/convert` حتى يتجدد الحد أو تُرقّي الخطة.

## الأمان والحماية

- التحقق من امتداد الملف وحجمه (حتى 15MB) قبل الإرسال لـ CloudConvert.
- مفتاح `CLOUDCONVERT_API_KEY` يبقى على الخادم فقط (لا بادئة `VITE_`)، لا يصل أبداً لمتصفح المستخدم.
- مهلة تنفيذ الدالة محددة بـ 60 ثانية (`vercel.json`) لمنع الطلبات المعلّقة.

## يحتاج إضافة يدوياً

- صورة `frontend/public/og-image.png` (1200×630) لمعاينة المشاركة على وسائل التواصل.
- دومين مخصص إن توفر.
