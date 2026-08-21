# NASSER PDF

أداة شخصية مجانية لتحويل الملفات إلى PDF، تحرير PDF، وإنشاء رموز QR — بدون تسجيل دخول أو لوحة تحكم.

## الأدوات

| الأداة | أين تعمل |
| --- | --- |
| Word (DOC/DOCX) → PDF | Vercel Serverless Functions تستدعي CloudConvert |
| Excel (XLS/XLSX) → PDF | Vercel Serverless Functions تستدعي CloudConvert |
| صور (PNG/JPG) → PDF | داخل المتصفح بالكامل (pdf-lib) |
| PDF Editor (دمج / تقسيم / ترتيب صفحات / علامة مائية) | داخل المتصفح بالكامل (pdf-lib + jszip) |
| QR Code | داخل المتصفح بالكامل (qrcode) |

## البنية

```
frontend/                     React + Vite — يُنشر على Vercel
frontend/api/convert-job.js   ينشئ مهمة تحويل على CloudConvert ويرجّع رابط رفع مباشر
frontend/api/convert-status.js  يتحقق من حالة المهمة ويرجّع رابط تنزيل الملف الناتج
```

مشروع واحد فقط على Vercel — لا حاجة لأي خادم منفصل. تحويل Word/Excel يمر بثلاث خطوات:
1. المتصفح يطلب من `/api/convert-job` إنشاء مهمة تحويل (طلب صغير، بدون الملف نفسه).
2. المتصفح يرفع الملف **مباشرة** إلى CloudConvert (مو عبر خادمنا) — هذا يتجاوز حد حجم الطلب
   على Vercel Serverless Functions (~4.5MB) ويسمح برفع ملفات أكبر بكثير.
3. المتصفح يستطلع `/api/convert-status` حتى يجهز الملف، ثم ينزّله مباشرة من رابط CloudConvert.

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

## النشر على Vercel

1. **New Project** → اختر الريبو → **Root Directory: `frontend`**.
2. Framework Preset: `Vite` (يُكتشف تلقائياً).
3. أضف متغير البيئة (Settings → Environment Variables):
   - Key: `CLOUDCONVERT_API_KEY`
   - Value: مفتاحك من [cloudconvert.com/dashboard/api/v2/keys](https://cloudconvert.com/dashboard/api/v2/keys)
   - **بدون** بادئة `VITE_` — هذا مهم حتى لا يظهر المفتاح في كود المتصفح.
4. Deploy.

## حدود الاستخدام — وشو ممكن نرفعه وشو لا

- **حجم الملفات**: مرفوع لحد معقول (100MB لـ Word/Excel، 50-75MB لأدوات الصور وPDF Editor) —
  هذي قيود وضعناها نحن للحماية من إساءة الاستخدام، قابلة للتعديل من ثوابت `MAX_FILE_MB` في كل صفحة.
- **عدد الصور/الملفات في أداة واحدة**: مرفوع (100 صورة، 50 ملف PDF للدمج) — قيد برمجي بسيط، لا يوجد
  سقف تقني حقيقي غير ذاكرة متصفح المستخدم نفسه عند كميات كبيرة جداً.
- **دقائق التحويل اليومية لـ Word/Excel (CloudConvert)**: هذا **حد حقيقي خارج عن تحكم الكود** —
  حسابك المجاني في CloudConvert عنده سقف يومي لدقائق التحويل. لا يمكن جعله "لا نهائي" مجاناً؛
  الخيارات هي: (أ) قبوله كما هو (كافٍ للاستخدام الشخصي)، (ب) ترقية خطة CloudConvert (مدفوعة)،
  أو (ج) العودة لتشغيل LibreOffice ذاتياً على خادم كـ Render (بدون أي سقف يومي، لكن يحتاج
  إدارة خادم منفصل بدل الاعتماد على API خارجي).

## الأمان والحماية

- التحقق من امتداد الملف وحجمه في المتصفح قبل بدء الرفع.
- مفتاح `CLOUDCONVERT_API_KEY` يبقى على الخادم فقط (لا بادئة `VITE_`)، لا يصل أبداً لمتصفح المستخدم.
- رفع الملف الفعلي يذهب مباشرة من المتصفح إلى CloudConvert، فلا يمر أبداً عبر خادمنا أو يُخزَّن فيه.

## يحتاج إضافة يدوياً

- صورة `frontend/public/og-image.png` (1200×630) لمعاينة المشاركة على وسائل التواصل.
- دومين مخصص إن توفر.
