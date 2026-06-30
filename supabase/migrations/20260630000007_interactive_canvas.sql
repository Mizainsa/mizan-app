-- supabase/migrations/20260630000007_interactive_canvas.sql
-- السبورة التفاعليّة: تخزين صور صفحات الكتب وربطها بمقاطع الدرس.
-- يتبع نمط إنشاء bucket المستخدَم في 20260629000002_homework_bucket.sql،
-- لكنّ هذا الـ bucket عامّ (public=true) لأنّ صور الصفحات تُعرض للطفل مباشرة.

-- ١. إنشاء الـ bucket العامّ lesson_pages (idempotent).
insert into storage.buckets (id, name, public)
values ('lesson_pages', 'lesson_pages', true)
on conflict (id) do nothing;

-- ٢. ربط صورة الصفحة بكلّ مقطع من مقاطع الدرس.
alter table public.lesson_chunks
  add column if not exists page_image_url text;

comment on column public.lesson_chunks.page_image_url is
  'رابط صورة صفحة الكتاب (في bucket lesson_pages) المرتبطة بهذا المقطع — تُعرض في السبورة التفاعليّة.';

-- ٣. سياسات RLS: قراءة عامّة لكائنات bucket lesson_pages فقط.
-- (الرفع/الكتابة يتمّ خادميًّا عبر service role الذي يتجاوز RLS تلقائيًّا.)
drop policy if exists "lesson_pages_objects_select" on storage.objects;
create policy "lesson_pages_objects_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'lesson_pages');
