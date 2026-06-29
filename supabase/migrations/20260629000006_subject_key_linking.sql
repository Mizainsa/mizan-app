-- Migration: ربط subjects بـhakeems عبر subject_key
-- لتمكين التصفية الصحيحة حسب المادة في journey وlesson

-- إضافة عمود subject_key لجدول subjects ليطابق hakeems.key
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS subject_key TEXT;

COMMENT ON COLUMN subjects.subject_key IS 'مفتاح المادة يطابق hakeems.key (math, science, etc.)';

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_subjects_subject_key ON subjects(subject_key);

-- تحديث subjects الموجودة لربطها بمفاتيح hakeems
-- (يجب تنفيذ هذا حسب البيانات الفعلية في قاعدة البيانات)
-- مثال: UPDATE subjects SET subject_key = 'math' WHERE name ILIKE '%رياضيات%';
