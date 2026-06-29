-- Migration: بنية الدروس المرتّبة مع الفصول والنوع
-- إضافة حقول لتتبع ترتيب الدروس ضمن الكتاب والفصول

-- إضافة الحقول الجديدة
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS lesson_order INT,
  ADD COLUMN IF NOT EXISTS chapter_number INT,
  ADD COLUMN IF NOT EXISTS chapter_title TEXT,
  ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'lesson' CHECK (
    lesson_type IN ('lesson', 'test_mid', 'test_chapter', 'test_cumulative', 'intro')
  ),
  ADD COLUMN IF NOT EXISTS page_start INT,
  ADD COLUMN IF NOT EXISTS page_end INT;

-- تعليقات توضيحية
COMMENT ON COLUMN public.lessons.lesson_order IS 'ترتيب الدرس في الكتاب (عبر جميع الفصول)';
COMMENT ON COLUMN public.lessons.chapter_number IS 'رقم الفصل (الوحدة) في الكتاب';
COMMENT ON COLUMN public.lessons.chapter_title IS 'عنوان الفصل (مثل: المقارنة والتصنيف)';
COMMENT ON COLUMN public.lessons.lesson_type IS 'نوع العنصر: درس، اختبار منتصف، اختبار فصل، تراكمي، تهيئة';
COMMENT ON COLUMN public.lessons.page_start IS 'رقم صفحة البداية في الكتاب';
COMMENT ON COLUMN public.lessons.page_end IS 'رقم صفحة النهاية في الكتاب';

-- فهرس للبحث السريع حسب المادة والجزء والترتيب
CREATE INDEX IF NOT EXISTS idx_lessons_ordered
  ON public.lessons(subject_id, part_number, lesson_order);

-- فهرس للبحث حسب الفصل
CREATE INDEX IF NOT EXISTS idx_lessons_chapter
  ON public.lessons(subject_id, part_number, chapter_number);

-- فهرس للبحث حسب النوع (للفصل بين الدروس والاختبارات)
CREATE INDEX IF NOT EXISTS idx_lessons_type
  ON public.lessons(lesson_type);
