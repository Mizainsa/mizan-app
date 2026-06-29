-- Migration: إضافة تتبّع الفصل الحالي عبر دفعات الاستيعاب
-- يُستخدم لتذكّر آخر فصل مرّ أثناء المعالجة التدريجية

ALTER TABLE public.ingestion_jobs
  ADD COLUMN IF NOT EXISTS current_chapter_number INT,
  ADD COLUMN IF NOT EXISTS current_chapter_title TEXT;

COMMENT ON COLUMN public.ingestion_jobs.current_chapter_number IS 'رقم آخر فصل مرّ أثناء المعالجة (يُحفظ بين الدفعات)';
COMMENT ON COLUMN public.ingestion_jobs.current_chapter_title IS 'عنوان آخر فصل مرّ أثناء المعالجة (يُحفظ بين الدفعات)';
