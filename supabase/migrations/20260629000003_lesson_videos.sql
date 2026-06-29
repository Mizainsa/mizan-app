-- supabase/migrations/20260629000003_lesson_videos.sql
-- فيديوهات الدروس المعرفية: لكل درس فيديو (يوتيوب) ونصّه (transcript) اختياريًّا.
-- بعد مشاهدة الفيديو يُمرَّر النصّ لـ rag-tutor كـ videoTranscript ليجمع حكيم
-- بين الفيديو والـPDF في إجاباته.

create table if not exists public.lesson_videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  video_id text,            -- معرّف فيديو يوتيوب
  transcript text,          -- نصّ الفيديو (لتغذية سياق حكيم)
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists lesson_videos_lesson_idx
  on public.lesson_videos (lesson_id);

-- محتوى تعليميّ عامّ → قراءة للجميع. (GRANT ضروري للأدوار — RLS وحده لا يكفي.)
alter table public.lesson_videos enable row level security;
grant select on public.lesson_videos to anon, authenticated;

drop policy if exists "lesson_videos_read_all" on public.lesson_videos;
create policy "lesson_videos_read_all"
  on public.lesson_videos
  for select
  using (true);
