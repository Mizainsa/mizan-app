-- ===== إعداد جداول قاعدة البيانات الجديدة لميزان =====
-- نفّذ هذا السكربت مرة واحدة في Supabase عبر: SQL Editor ثم New Query ثم لصق هذا النص ثم Run.
-- هذه الجداول لا تخزّن أي بيانات للمستخدمين؛ فقط إعدادات عامة تتحكم بها لوحة الإدارة،
-- وتقارير أعطال تقنية بلا هوية للمستخدم.

-- جدول الإعدادات اللحظية (حدود الباقات وتفعيل الميزات)
create table if not exists app_settings (
  setting_key text primary key,
  setting_value text not null,
  updated_at timestamptz default now()
);

-- جدول تقارير الأعطال التقنية (بلا بيانات مستخدم)
create table if not exists error_reports (
  id bigint generated always as identity primary key,
  message text,
  platform text,
  app_version text,
  created_at timestamptz default now()
);

-- جدول سجل الموافقة القانونية (سجل امتثال يحمي قانونياً — ليس بيانات استخدام)
-- يخزّن فقط: معرّف المستخدم، أنه وافق، ووقت الموافقة. لا محتوى ولا محادثات.
create table if not exists user_consents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  terms_accepted boolean not null default false,
  terms_accepted_at timestamptz,
  updated_at timestamptz default now()
);

-- حماية الصف: كل مستخدم يكتب/يقرأ سجل موافقته فقط
alter table user_consents enable row level security;

drop policy if exists "consent_select_own" on user_consents;
create policy "consent_select_own" on user_consents
  for select using (auth.uid() = user_id);

drop policy if exists "consent_insert_own" on user_consents;
create policy "consent_insert_own" on user_consents
  for insert with check (auth.uid() = user_id);

drop policy if exists "consent_update_own" on user_consents;
create policy "consent_update_own" on user_consents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- قيم ابتدائية اختيارية: حد المحادثات المجانية وتفعيل كل الميزات
insert into app_settings (setting_key, setting_value) values
  ('free_chat_limit', '20'),
  ('feature_calculators', 'true'),
  ('feature_specialized', 'true'),
  ('feature_documents', 'true'),
  ('feature_knowledge', 'true'),
  ('feature_reminders', 'true'),
  ('feature_templates', 'true'),
  ('feature_compare', 'true'),
  ('feature_signature', 'true'),
  ('feature_voice', 'true'),
  ('feature_camera', 'true')
on conflict (setting_key) do nothing;

-- ملاحظة: لا حاجة لتفعيل سياسات RLS لهذه الجداول لأن كل الوصول يتم عبر الخادم
-- (Edge Function) بمفتاح الخدمة، والكتابة محمية بكلمة مرور المسؤول داخل الخادم.
