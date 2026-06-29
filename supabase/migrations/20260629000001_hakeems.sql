-- supabase/migrations/20260629000001_hakeems.sql
-- جدول «الحكماء الستة» للشاشة الرئيسية: مصدر واحد للحقيقة بدل المصفوفة الثابتة في الكود.
-- مستقلّ عن جدول subjects (المرتبط بالصفوف والدروس) فلا يكسر علاقة lessons.subject_id.

create table if not exists public.hakeems (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,        -- مفتاح المادّة (math, science, ...) يطابق ألوان الهالة ومسار الدرس
  name_ar text not null,           -- اسم المادّة بالعربية
  color text not null,             -- لون الهوية البصرية
  emoji text,                      -- رمز تعبيري للبطاقة (احتياط بصريّ)
  grade int,                       -- صفّ افتراضيّ (اختياريّ — null = كل الصفوف)
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- محتوى عامّ → قراءة للجميع. (GRANT ضروري للأدوار؛ RLS وحده لا يكفي — درس مكلف.)
alter table public.hakeems enable row level security;
grant select on public.hakeems to anon, authenticated;

drop policy if exists "hakeems_read_all" on public.hakeems;
create policy "hakeems_read_all"
  on public.hakeems
  for select
  using (true);

-- تعبئة الحكماء الستة (idempotent: لا يكرّر عند إعادة التطبيق).
insert into public.hakeems (key, name_ar, color, emoji, sort_order) values
  ('math',        'الرياضيات',  '#FF9F1C', '🔢', 1),
  ('science',     'العلوم',     '#10B981', '🔬', 2),
  ('english',     'الإنجليزية', '#3B82F6', '🔤', 3),
  ('arabic',      'العربية',    '#8B5CF6', '📖', 4),
  ('calligraphy', 'الخط',       '#0EA5E9', '🖌️', 5),
  ('creative',    'الإبداع',    '#EC4899', '🎨', 6)
on conflict (key) do nothing;
