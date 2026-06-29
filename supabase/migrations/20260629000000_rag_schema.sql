-- supabase/migrations/20260629000000_rag_schema.sql
-- ترقية «عالم حكيم» إلى منصّة RAG: تفعيل pgvector + جداول المقاطع والاستمرارية والواجبات.
-- مكتوبة للمراجعة فقط — لا تُطبَّق إلّا بعد موافقة المالك (supabase db push).

-- ===== ١. تفعيل امتداد المتّجهات =====
create extension if not exists vector;

-- ===== ٢. جدول مقاطع الدروس (التخزين المتّجهيّ للـ RAG) =====
-- كل درس يُقسَّم لمقاطع، ولكل مقطع embedding بطول ٧٦٨ (Gemini text-embedding-004).
create table if not exists public.lesson_chunks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  subject text,
  grade_order int,
  chunk_index int not null,
  content text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

-- فهرس IVFFlat للبحث بالتشابه الكوني (cosine). lists=100 مناسب للأحجام المتوسّطة.
create index if not exists lesson_chunks_embedding_idx
  on public.lesson_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- فهرس مساعد للعزل التامّ حسب الدرس.
create index if not exists lesson_chunks_lesson_id_idx
  on public.lesson_chunks (lesson_id);

-- ===== ٣. جدول جلسات التعلّم (ذاكرة الاستمرارية) =====
create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  subject text,
  last_lesson_id uuid references public.lessons (id) on delete set null,
  last_chunk_index int,
  pending_homework boolean not null default false,
  session_summary text,
  updated_at timestamptz not null default now()
);

create index if not exists learning_sessions_child_idx
  on public.learning_sessions (child_id);

-- ===== ٤. جدول تسليمات الواجبات =====
create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  submission_type text,          -- 'image' | 'audio' | 'text'
  submission_url text,
  evaluation text,
  score int,
  created_at timestamptz not null default now()
);

create index if not exists homework_submissions_child_idx
  on public.homework_submissions (child_id);

-- ===== ٥. دالّة البحث بالتشابه (RAG) — مقيّدة بالدرس (عزل تامّ) =====
create or replace function public.match_lesson_chunks(
  query_embedding vector(768),
  p_lesson_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  chunk_index int,
  similarity float
)
language sql
stable
as $$
  select
    lc.id,
    lc.content,
    lc.chunk_index,
    1 - (lc.embedding <=> query_embedding) as similarity
  from public.lesson_chunks lc
  where lc.lesson_id = p_lesson_id           -- العزل التامّ: لا نخرج أبدًا خارج الدرس
  order by lc.embedding <=> query_embedding   -- ترتيب تصاعديّ بمسافة الكوزاين
  limit match_count;
$$;

-- ===== ٦. الأمان: RLS + GRANT =====
-- درس مكلف مطبّق: GRANT ضروري للأدوار (RLS وحده لا يكفي)،
-- وكل سياسة إدراج/تعديل تحمل WITH CHECK (ALL USING بلا WITH CHECK يمنع الإدراج صامتًا).

alter table public.lesson_chunks       enable row level security;
alter table public.learning_sessions   enable row level security;
alter table public.homework_submissions enable row level security;

-- --- lesson_chunks: محتوى تعليميّ -> قراءة عامّة. الكتابة عبر مفتاح الخدمة فقط (يتجاوز RLS).
grant select on public.lesson_chunks to anon, authenticated;

drop policy if exists "lesson_chunks_read_all" on public.lesson_chunks;
create policy "lesson_chunks_read_all"
  on public.lesson_chunks
  for select
  using (true);

-- --- learning_sessions: خاصّة بوليّ أمر الطفل المصادَق فقط.
grant select, insert, update, delete on public.learning_sessions to authenticated;

drop policy if exists "learning_sessions_select_own" on public.learning_sessions;
create policy "learning_sessions_select_own"
  on public.learning_sessions
  for select
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

drop policy if exists "learning_sessions_insert_own" on public.learning_sessions;
create policy "learning_sessions_insert_own"
  on public.learning_sessions
  for insert
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

drop policy if exists "learning_sessions_update_own" on public.learning_sessions;
create policy "learning_sessions_update_own"
  on public.learning_sessions
  for update
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  )
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

-- --- homework_submissions: خاصّة بوليّ أمر الطفل المصادَق فقط.
grant select, insert, update, delete on public.homework_submissions to authenticated;

drop policy if exists "homework_select_own" on public.homework_submissions;
create policy "homework_select_own"
  on public.homework_submissions
  for select
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

drop policy if exists "homework_insert_own" on public.homework_submissions;
create policy "homework_insert_own"
  on public.homework_submissions
  for insert
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

drop policy if exists "homework_update_own" on public.homework_submissions;
create policy "homework_update_own"
  on public.homework_submissions
  for update
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  )
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

-- --- دالّة البحث: متاحة للأدوار (تُستدعى من الخادم/العميل).
grant execute on function public.match_lesson_chunks(vector, uuid, int) to anon, authenticated;
