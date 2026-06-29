-- supabase/migrations/20260629000002_homework_bucket.sql
-- مخزن ملفّات الواجبات: bucket خاصّ (غير عامّ) يرفع إليه الطفل صورة واجبه أو تسجيله الصوتيّ.
-- يكمّل جدول homework_submissions (المنشأ في 20260629000000_rag_schema.sql).

-- إنشاء الـ bucket (idempotent).
insert into storage.buckets (id, name, public)
values ('homework', 'homework', false)
on conflict (id) do nothing;

-- السياسات: المستخدم المصادَق (وليّ الأمر) يرفع ويقرأ ملفّات هذا الـ bucket فقط.
-- (الكتابة الخادمية عبر service role تتجاوز RLS تلقائيًّا.)
drop policy if exists "homework_objects_insert" on storage.objects;
create policy "homework_objects_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'homework');

drop policy if exists "homework_objects_select" on storage.objects;
create policy "homework_objects_select"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'homework');

drop policy if exists "homework_objects_update" on storage.objects;
create policy "homework_objects_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'homework')
  with check (bucket_id = 'homework');
