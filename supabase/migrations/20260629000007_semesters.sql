-- Migration: جدول الفصول الدراسية (مرن يدعم 2 أو 3 فصول)
-- يربط كل فصل بجزء الكتاب المخصص له

CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label TEXT NOT NULL,           -- السنة الهجرية مثل "1448"
  term_number INT NOT NULL,            -- رقم الفصل (1، 2، 3)
  term_name TEXT,                      -- اسم الفصل (اختياري، مثل "الفصل الأول")
  start_date DATE,                     -- تاريخ البداية
  end_date DATE,                       -- تاريخ النهاية
  part_number INT,                     -- رقم جزء الكتاب المخصص لهذا الفصل
  is_active BOOLEAN NOT NULL DEFAULT false,  -- هل الفصل نشط حالياً
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.semesters IS 'الفصول الدراسية - مرن يقبل أي عدد (2 أو 3 فصول)';
COMMENT ON COLUMN public.semesters.year_label IS 'السنة الهجرية (نصّ مثل 1448)';
COMMENT ON COLUMN public.semesters.term_number IS 'رقم الفصل (1-3)';
COMMENT ON COLUMN public.semesters.part_number IS 'رقم جزء الكتاب المخصص';
COMMENT ON COLUMN public.semesters.is_active IS 'الفصل النشط حالياً (واحد فقط active)';

-- فهرس للبحث عن الفصل النشط
CREATE INDEX IF NOT EXISTS idx_semesters_active ON public.semesters(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_semesters_dates ON public.semesters(start_date, end_date);

-- RLS + Grant
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.semesters TO anon, authenticated;

DROP POLICY IF EXISTS "semesters_read_all" ON public.semesters;
CREATE POLICY "semesters_read_all"
  ON public.semesters
  FOR SELECT
  USING (true);

-- بيانات العام الحالي (1448 - نظام 3 فصول كبداية)
INSERT INTO public.semesters (year_label, term_number, term_name, start_date, end_date, part_number, is_active) VALUES
  ('1448', 1, 'الفصل الدراسي الأول', '2026-08-15', '2026-12-15', 1, false),
  ('1448', 2, 'الفصل الدراسي الثاني', '2026-12-25', '2027-04-20', 2, true),
  ('1448', 3, 'الفصل الدراسي الثالث', '2027-04-30', '2027-07-15', 3, false)
ON CONFLICT DO NOTHING;
