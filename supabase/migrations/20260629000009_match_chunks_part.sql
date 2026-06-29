-- Migration: تحديث match_lesson_chunks لإرجاع part_number

-- حذف الدالة القديمة
DROP FUNCTION IF EXISTS public.match_lesson_chunks(vector, uuid, int);

-- إعادة إنشاء الدالة مع part_number
CREATE OR REPLACE FUNCTION public.match_lesson_chunks(
  query_embedding vector(768),
  p_lesson_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  chunk_index int,
  page_number int,
  part_number int,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    lc.id,
    lc.content,
    lc.chunk_index,
    lc.page_number,
    lc.part_number,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM public.lesson_chunks lc
  WHERE lc.lesson_id = p_lesson_id
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- GRANT
GRANT EXECUTE ON FUNCTION public.match_lesson_chunks(vector, uuid, int) TO anon, authenticated;
