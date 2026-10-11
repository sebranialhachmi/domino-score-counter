# تاكسي العمرة — النسخة المستقلة

موقع ولوحة تحكم ثنائيا اللغة (عربي/إنجليزي) لشركة نقل وتاكسي.
هذه النسخة مستقلة عن مشروع Lovable الأصلي: لها قاعدة بيانات خاصة بها (Supabase) وتُنشر على Vercel.

- **الواجهة والخادم:** TanStack Start (React 19 + Vite) مع Tailwind و shadcn/ui
- **قاعدة البيانات والدخول والملفات:** Supabase
- **الاستضافة:** Vercel

---

## 1. إنشاء قاعدة البيانات (مرة واحدة)

1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. طبّق ملفات الترحيل الموجودة في `supabase/migrations` بالترتيب، بإحدى الطريقتين:
   - **من سطر الأوامر:**
     ```bash
     npx supabase login
     npx supabase link --project-ref <project-ref>
     npx supabase db push
     ```
   - **أو يدوياً:** افتح كل ملف بالترتيب (حسب الاسم) والصقه في **SQL Editor** في لوحة Supabase ثم شغّله.
3. **أوقف التسجيل العام:** Authentication ← Sign In / Providers ← عطّل **Allow new users to sign up**.
4. **أنشئ أول مدير:**
   - Authentication ← Users ← **Add user** (بريد + كلمة مرور، وفعّل Auto Confirm).
   - انسخ الـ User UID، ثم شغّل في SQL Editor:
     ```sql
     insert into public.user_roles (user_id, role) values ('<USER-UID>', 'admin');
     ```
   بعدها تضيف بقية الموظفين من لوحة التحكم: **المستخدمون**.

> نقل المحتوى من الموقع الأصلي (المقالات والصفحات والأسئلة الشائعة): من لوحة تحكم الموقع الأصلي **النسخ الاحتياطي ← تصدير**، ثم في الموقع الجديد **النسخ الاحتياطي ← استيراد**.

## 2. الإعدادات (متغيرات البيئة)

انسخ `.env.example` إلى `.env` واملأ القيم. أهمها:

| المتغير | من أين | ملاحظات |
|---|---|---|
| `VITE_SITE_URL` | دومينك | مثال `https://example.com`. إلى أن تشتري الدومين استخدم رابط `*.vercel.app` |
| `SUPABASE_URL` و `VITE_SUPABASE_URL` | Supabase ← Project Settings ← API | نفس القيمة |
| `SUPABASE_PUBLISHABLE_KEY` و `VITE_SUPABASE_PUBLISHABLE_KEY` | نفس الصفحة (anon / publishable) | مفتاح عام |
| `SUPABASE_SERVICE_ROLE_KEY` | نفس الصفحة (service_role / secret) | **سري** — لا يوضع في الكود أبداً |
| `VITE_SITE_PHONE`, `VITE_SITE_WHATSAPP`, `VITE_SITE_EMAIL`, `VITE_SITE_BRAND_AR` … | بيانات شركتك | كلها اختيارية ولها قيم افتراضية في `src/lib/site-info.ts` |
| `CRON_SECRET` | أي نص عشوائي طويل | لحماية رابط معالجة الإشعارات |

تغيير الدومين لاحقاً = تغيير `VITE_SITE_URL` فقط ثم إعادة النشر: الروابط الأساسية وخريطة الموقع و`robots.txt` و`llms.txt` والبيانات المنظمة كلها تتبعه.

## 3. التشغيل محلياً

```bash
npm install
npm run dev      # http://localhost:5173/ar
```

## 4. النشر على Vercel

البناء يكتشف Vercel تلقائياً وينتج المخرجات المناسبة له (`.vercel/output`)، فلا حاجة لأي إعداد خاص في الكود.

1. في Vercel ← المشروع ← **Settings ← Build and Deployment**:
   - **Framework Preset:** `Other`
   - **Build Command:** `npm run build` — اترك **Output Directory** و **Install Command** على الافتراضي.
   - **Node.js Version:** `22.x`
2. في **Settings ← Environment Variables** أضف (لكل البيئات: Production و Preview):
   - `VITE_SITE_URL` — رابط الموقع (مثل `https://taxiomra.vercel.app`)
   - `SUPABASE_URL` و `VITE_SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY` و `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **سري**: من Supabase ← Project Settings ← API Keys ← secret
   - `CRON_SECRET` — أي نص عشوائي طويل
   - (اختياري) `VITE_SITE_PHONE`, `VITE_SITE_WHATSAPP`, `VITE_SITE_EMAIL`, `VITE_SITE_BRAND_AR` …
3. **Deployments ← Redeploy**، أو ادفع أي تعديل إلى GitHub فيُنشر تلقائياً.

**ربط الدومين بعد شرائه:** Vercel ← **Settings ← Domains ← Add**، ثم غيّر `VITE_SITE_URL` إلى الدومين وأعد النشر. أضف الدومين أيضاً في Supabase ← Authentication ← URL Configuration (Site URL و Redirect URLs) حتى تعمل رسائل استعادة كلمة المرور.

> النشر على Cloudflare Workers ما زال ممكناً: خارج Vercel يبني المشروع لـ Cloudflare تلقائياً (`npm run build` ثم `npx wrangler deploy`).

## ملاحظات

- **الذكاء الاصطناعي في لوحة التحكم** (توليد المقالات وبيانات SEO) يعتمد حالياً على بوابة Lovable (`LOVABLE_API_KEY`)، ولن يعمل خارج Lovable حتى يُربط بمزود آخر.
- **إرسال واتساب والبريد** من طابور الإشعارات ما زال قالباً غير مربوط بمزود فعلي.
- ملفات الترحيل جُرّبت كاملة على قاعدة بيانات فارغة وتطابق بنية الجداول التي يتوقعها التطبيق.
