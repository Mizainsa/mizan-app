-- Migration: طبقة النمذجة الدقيقة - 3 جداول
-- تتبع دقيق لإتقان المفاهيم + الأخطاء الشائعة + المسار المخصص

-- ===== ١. جدول إتقان المهارات (Skill Mastery) =====
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  micro_concept TEXT NOT NULL,            -- المفهوم الدقيق (مثل "جمع الأعداد ضمن 10")
  subject TEXT NOT NULL,                  -- المادة (math, science, ...)
  mastery_score INT NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),
  attempts INT NOT NULL DEFAULT 0,        -- عدد المحاولات
  last_reviewed TIMESTAMPTZ,              -- آخر مراجعة
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'fragile', 'mastered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.skill_mastery IS 'تتبع إتقان كل مفهوم دقيق لكل طفل';
COMMENT ON COLUMN public.skill_mastery.micro_concept IS 'المفهوم الدقيق (granular concept)';
COMMENT ON COLUMN public.skill_mastery.mastery_score IS 'درجة الإتقان 0-100';
COMMENT ON COLUMN public.skill_mastery.status IS 'not_started: لم يبدأ، fragile: هشّ، mastered: متقن';

CREATE INDEX IF NOT EXISTS idx_skill_mastery_child ON public.skill_mastery(child_id);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_subject ON public.skill_mastery(child_id, subject);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_status ON public.skill_mastery(child_id, status);

-- ===== ٢. جدول الأخطاء الشائعة (Misconceptions) =====
CREATE TABLE IF NOT EXISTS public.misconceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  micro_concept TEXT NOT NULL,            -- المفهوم المرتبط
  error_pattern TEXT NOT NULL,            -- نمط الخطأ (مثل "يعكس الأرقام في الطرح")
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolution_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.misconceptions IS 'تسجيل الأخطاء المتكررة والأنماط الخاطئة';
COMMENT ON COLUMN public.misconceptions.error_pattern IS 'وصف نمط الخطأ';
COMMENT ON COLUMN public.misconceptions.resolved IS 'هل تم حل الخطأ؟';

CREATE INDEX IF NOT EXISTS idx_misconceptions_child ON public.misconceptions(child_id);
CREATE INDEX IF NOT EXISTS idx_misconceptions_unresolved ON public.misconceptions(child_id) WHERE resolved = false;

-- ===== ٣. جدول المسار التعليمي (Learning Path) =====
CREATE TABLE IF NOT EXISTS public.learning_path (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,                  -- المادة
  ordered_concepts JSONB,                 -- المسار المخصص كـarray من المفاهيم
  current_position INT NOT NULL DEFAULT 0, -- الموضع الحالي في المسار
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, subject)               -- مسار واحد لكل طفل/مادة
);

COMMENT ON TABLE public.learning_path IS 'المسار التعليمي المخصص لكل طفل';
COMMENT ON COLUMN public.learning_path.ordered_concepts IS 'مصفوفة JSON مرتبة من المفاهيم';
COMMENT ON COLUMN public.learning_path.current_position IS 'الفهرس الحالي في ordered_concepts';

CREATE INDEX IF NOT EXISTS idx_learning_path_child ON public.learning_path(child_id);

-- ===== RLS + GRANT =====
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misconceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path ENABLE ROW LEVEL SECURITY;

-- skill_mastery: خاص بولي الأمر
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_mastery TO authenticated;

DROP POLICY IF EXISTS "skill_mastery_select_own" ON public.skill_mastery;
CREATE POLICY "skill_mastery_select_own" ON public.skill_mastery
  FOR SELECT USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "skill_mastery_insert_own" ON public.skill_mastery;
CREATE POLICY "skill_mastery_insert_own" ON public.skill_mastery
  FOR INSERT WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "skill_mastery_update_own" ON public.skill_mastery;
CREATE POLICY "skill_mastery_update_own" ON public.skill_mastery
  FOR UPDATE USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

-- misconceptions: خاص بولي الأمر
GRANT SELECT, INSERT, UPDATE, DELETE ON public.misconceptions TO authenticated;

DROP POLICY IF EXISTS "misconceptions_select_own" ON public.misconceptions;
CREATE POLICY "misconceptions_select_own" ON public.misconceptions
  FOR SELECT USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "misconceptions_insert_own" ON public.misconceptions;
CREATE POLICY "misconceptions_insert_own" ON public.misconceptions
  FOR INSERT WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "misconceptions_update_own" ON public.misconceptions;
CREATE POLICY "misconceptions_update_own" ON public.misconceptions
  FOR UPDATE USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

-- learning_path: خاص بولي الأمر
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_path TO authenticated;

DROP POLICY IF EXISTS "learning_path_select_own" ON public.learning_path;
CREATE POLICY "learning_path_select_own" ON public.learning_path
  FOR SELECT USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "learning_path_insert_own" ON public.learning_path;
CREATE POLICY "learning_path_insert_own" ON public.learning_path
  FOR INSERT WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

DROP POLICY IF EXISTS "learning_path_update_own" ON public.learning_path;
CREATE POLICY "learning_path_update_own" ON public.learning_path
  FOR UPDATE USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));
