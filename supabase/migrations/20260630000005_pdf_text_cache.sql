-- Migration: جدول تخزين النصّ المستخرج من PDF
-- يفصل الاستخراج الثقيل عن معالجة Edge Function

CREATE TABLE IF NOT EXISTS public.pdf_text_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.ingestion_jobs(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  page_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهرس للاستعلام السريع حسب المهمّة ورقم الصفحة
CREATE INDEX IF NOT EXISTS idx_pdf_text_cache_job_page
  ON public.pdf_text_cache(job_id, page_number);

-- عمود لتتبّع ما إذا تمّ استخراج النصّ
ALTER TABLE public.ingestion_jobs
  ADD COLUMN IF NOT EXISTS text_extracted BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON TABLE public.pdf_text_cache IS 'تخزين النصّ المستخرج من PDF لتجنّب تحميل الملف في Edge Functions';
COMMENT ON COLUMN public.pdf_text_cache.job_id IS 'معرّف مهمّة الاستيعاب';
COMMENT ON COLUMN public.pdf_text_cache.page_number IS 'رقم الصفحة (يبدأ من 1)';
COMMENT ON COLUMN public.pdf_text_cache.page_text IS 'النصّ المستخرج من الصفحة';
COMMENT ON COLUMN public.ingestion_jobs.text_extracted IS 'هل تمّ استخراج نصّ الكتاب كاملاً؟';

-- RLS: قراءة عامة (authenticated)
ALTER TABLE public.pdf_text_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "السماح بقراءة النصوص للمستخدمين المصادقين" ON public.pdf_text_cache;
CREATE POLICY "السماح بقراءة النصوص للمستخدمين المصادقين"
  ON public.pdf_text_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- service_role يمكنه الكتابة (للاستخراج)
GRANT SELECT ON public.pdf_text_cache TO authenticated;
GRANT ALL ON public.pdf_text_cache TO service_role;
