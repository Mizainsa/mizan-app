-- Migration: إضافة تتبّع الدرس المفتوح للاستيعاب التدريجي
-- يُستخدم لربط مقاطع الدفعات بالدرس الصحيح حتى يظهر عنوان جديد

ALTER TABLE public.ingestion_jobs
  ADD COLUMN IF NOT EXISTS current_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.ingestion_jobs.current_lesson_id IS 'معرّف آخر درس مفتوح (يُربط به مقاطع الدفعات حتى يظهر عنوان جديد)';
