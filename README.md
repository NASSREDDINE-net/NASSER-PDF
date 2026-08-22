# NASSER PDF

أداة شخصية مجانية لتحويل الملفات إلى PDF، تحرير PDF، وإنشاء رموز QR — بدون تسجيل دخول أو لوحة تحكم.

## الأدوات

| الأداة | أين تعمل |
| --- | --- |
| Word (DOC/DOCX) → PDF، PDF → Word/Excel | CloudConvert، مع LibreOffice على Render كاحتياط اختياري |
| ضغط PDF | Vercel Serverless Functions تستدعي CloudConvert (عملية `optimize`) |
| صور (PNG/JPG) → PDF، PDF → صور | داخل المتصفح بالكامل (pdf-lib / pdfjs-dist) |
| PDF Editor (دمج / تقسيم / ترتيب صفحات / علامة مائية / تحرير مرئي) | داخل المتصفح بالكامل (pdf-lib + jszip + pdfjs-dist) |
| استخراج نص، تعبئة نماذج PDF | داخل المتصفح بالكامل (pdfjs-dist / pdf-lib forms) |
| QR Code | داخل المتصفح بالكامل (qrcode) |

## البنية

```
frontend/                       React + Vite — يُنشر على Vercel
frontend/api/convert-job.js     ينشئ مهمة تحويل على CloudConvert ويرجّع رابط رفع مباشر
frontend/api/convert-status.js  يتحقق من حالة المهمة ويرجّع رابط تنزيل الملف الناتج
backend/                        خادم LibreOffice احتياطي (اختياري) — Express + Docker، يُنشر على Render
render.yaml                     Render Blueprint لنشر backend/ تلقائياً
```

### تحويل Word/Excel/PDF — CloudConvert أولاً، LibreOffice احتياط اختياري

الوضع الافتراضي (بدون أي إعداد إضافي): تحويل Word/Excel يمر بثلاث خطوات عبر CloudConvert:
1. المتصفح يطلب من `/api/convert-job` إنشاء مهمة تحويل (طلب صغير، بدون الملف نفسه).
2. المتصفح يرفع الملف **مباشرة** إلى CloudConvert (مو عبر خادمنا) — هذا يتجاوز حد حجم الطلب
   على Vercel Serverless Functions (~4.5MB) ويسمح برفع ملفات أكبر بكثير.
3. المتصفح يستطلع `/api/convert-status` حتى يجهز الملف، ثم ينزّله مباشرة من رابط CloudConvert.

**اختياري**: لو نشرت `backend/` على Render وضبطت `VITE_RENDER_API_URL` على Vercel (انظر أدناه)،
يصير عندك **احتياط تلقائي**: إذا فشل CloudConvert لأي سبب (تجاوزت الحد اليومي، عطل مؤقت، إلخ)،
المتصفح يعيد المحاولة تلقائياً عبر خادم LibreOffice الخاص بك على Render قبل ما يعرض خطأ للمستخدم.
بدون هذا الإعداد، الموقع يعتمد على CloudConvert فقط ولا يوجد احتياط — وهذا يعمل تماماً بدون
الحاجة لنشر `backend/` إطلاقاً إذا ما تحتاج الاحتياط.

مفتاح `CLOUDCONVERT_API_KEY` يبقى على الخادم فقط طوال هذه العملية. أدوات الصور، PDF Editor،
وQR Code لا تحتاج أي خادم إطلاقاً وتعمل مجاناً بدون أي حدود استخدام خارجية.

## التشغيل محلياً

```bash
cd frontend
npm install
npm run dev
```

أدوات الصور، PDF Editor، وQR Code تعمل مباشرة مع `npm run dev`. لاختبار Word/Excel → PDF محلياً
تحتاج [Vercel CLI](https://vercel.com/docs/cli) لتشغيل الـ Serverless Functions:

```bash
npm i -g vercel
cd frontend
vercel dev
```

ثم أنشئ ملف `frontend/.env.local` وضع فيه مفتاح CloudConvert (انظر `.env.example`):

```
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key_here
```

لتشغيل خادم LibreOffice الاحتياطي محلياً (اختياري، يحتاج Docker):

```bash
cd backend
docker build -t nasser-pdf-backend .
docker run -p 3000:3000 -e ALLOWED_ORIGINS=http://localhost:5173 nasser-pdf-backend
```

ثم أضف في `frontend/.env.local`:

```
VITE_RENDER_API_URL=http://localhost:3000
```

## النشر على Vercel (الموقع نفسه)

1. **New Project** → اختر الريبو → **Root Directory: `frontend`**.
2. Framework Preset: `Vite` (يُكتشف تلقائياً).
3. أضف متغير البيئة (Settings → Environment Variables):
   - Key: `CLOUDCONVERT_API_KEY`
   - Value: مفتاحك من [cloudconvert.com/dashboard/api/v2/keys](https://cloudconvert.com/dashboard/api/v2/keys)
   - **بدون** بادئة `VITE_` — هذا مهم حتى لا يظهر المفتاح في كود المتصفح.
4. Deploy.

## نشر الاحتياط على Render (اختياري)

1. من لوحة Render: **New → Blueprint**، واختر هذا الريبو (يقرأ `render.yaml` تلقائياً).
2. الخطة: `Free`. أول بناء يأخذ 5-10 دقائق (تثبيت LibreOffice كامل داخل الحاوية).
3. بعد أول نشر، عدّل متغير البيئة `ALLOWED_ORIGINS` على Render ليطابق رابط موقعك على Vercel.
4. انسخ رابط خدمة Render (مثال: `https://nasser-pdf-backend.onrender.com`).
5. ارجع لـ Vercel → Settings → Environment Variables → أضف:
   - Key: `VITE_RENDER_API_URL`
   - Value: رابط خدمة Render من الخطوة السابقة
6. أعد نشر الـ Frontend (Redeploy) حتى يلتقط المتغير الجديد.
7. ملاحظة: الخطة المجانية على Render "تنام" بعد فترة خمول، فأول طلب احتياطي بعد فترة خمول
   قد يستغرق 30-50 ثانية إضافية. هذا طبيعي ويحدث فقط عند اللجوء للاحتياط، لا في المسار العادي.

## حدود الاستخدام — وشو ممكن نرفعه وشو لا

- **حجم الملفات**: مرفوع لحد معقول (100MB لـ Word/Excel، 50-75MB لأدوات الصور وPDF Editor) —
  هذي قيود وضعناها نحن للحماية من إساءة الاستخدام، قابلة للتعديل من ثوابت `MAX_FILE_MB` في كل صفحة.
- **عدد الصور/الملفات في أداة واحدة**: مرفوع (100 صورة، 50 ملف PDF للدمج) — قيد برمجي بسيط، لا يوجد
  سقف تقني حقيقي غير ذاكرة متصفح المستخدم نفسه عند كميات كبيرة جداً.
- **دقائق التحويل اليومية لـ Word/Excel (CloudConvert)**: هذا **حد حقيقي خارج عن تحكم الكود** —
  حسابك المجاني في CloudConvert عنده سقف يومي لدقائق التحويل. مع الاحتياط عبر Render، تجاوز هذا
  الحد ما عاد يعني توقف الخدمة — الموقع يتحول تلقائياً لـ LibreOffice بدون أي سقف. الضغط (Compress)
  استثناء: يبقى معتمداً على CloudConvert فقط حالياً بدون احتياط.

## ملاحظة حول ضغط PDF

أداة الضغط تستخدم عملية `optimize` من CloudConvert مع أحد ملفات إعداد Ghostscript المعروفة
(`web`/`print`/`archive`). هذا الجزء لم يُختبر مقابل حساب CloudConvert فعلي وقت الكتابة —
إذا رجعت رسالة خطأ عند الضغط، الأرجح أن اسم الـ `profile` يحتاج تعديل بسيط في
`frontend/api/convert-job.js` (نص الخطأ من CloudConvert نفسه سيوضح القيم المقبولة).

## الأمان والحماية

- التحقق من امتداد الملف وحجمه في المتصفح قبل بدء الرفع.
- مفتاح `CLOUDCONVERT_API_KEY` يبقى على الخادم فقط (لا بادئة `VITE_`)، لا يصل أبداً لمتصفح المستخدم.
- رفع الملف الفعلي يذهب مباشرة من المتصفح إلى CloudConvert، فلا يمر أبداً عبر خادمنا أو يُخزَّن فيه.
- خادم Render الاحتياطي (إن استُخدم): CORS مقيّد بدومين الواجهة الأمامية، وكل ملف يُحوَّل في
  مجلد مؤقت معزول يُحذف فوراً بعد الاستجابة.

## يحتاج إضافة يدوياً

- صورة `frontend/public/og-image.png` (1200×630) لمعاينة المشاركة على وسائل التواصل.
- دومين مخصص إن توفر.
