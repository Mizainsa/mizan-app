-- Migration: منع تكرار الدروس
-- السبب: الوظيفة تُعاد تشغيلها على صفحات مُعالَجة سابقاً فتُدرج نسخاً مكرّرة
-- الحل: قيد تفرّد على (subject_id, part_number, page_start, lesson_type)

-- حذف المكرّر الموجود حالياً (نبقي أقدم نسخة لكل مجموعة)
DELETE FROM public.lessons
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY subject_id, part_number, page_start, lesson_type
        ORDER BY created_at ASC
      ) AS rn
    FROM public.lessons
  ) t
  WHERE rn > 1
);

-- إضافة قيد التفرّد
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_unique_key
  UNIQUE (subject_id, part_number, page_start, lesson_type);

COMMENT ON CONSTRAINT lessons_unique_key ON public.lessons IS
  'يمنع تكرار الدرس: نفس المادة + الجزء + الصفحة + النوع = درس واحد فقط';
