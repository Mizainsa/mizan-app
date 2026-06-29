-- Migration: part_number للتعامل مع أجزاء الكتب
-- لا تعارض أرقام صفحات: كل جزء له page_number مستقل

-- إضافة part_number لجدول lessons
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS part_number INT DEFAULT 1;

COMMENT ON COLUMN lessons.part_number IS 'رقم جزء الكتاب (1، 2، 3، ...)';

-- إضافة part_number لجدول lesson_chunks
ALTER TABLE lesson_chunks
  ADD COLUMN IF NOT EXISTS part_number INT DEFAULT 1;

COMMENT ON COLUMN lesson_chunks.part_number IS 'رقم الجزء (يمنع التباس أرقام الصفحات بين الأجزاء)';

-- فهرس للبحث حسب جزء+صفحة
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_part_page
  ON lesson_chunks(lesson_id, part_number, page_number);
