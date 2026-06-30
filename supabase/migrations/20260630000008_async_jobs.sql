-- Async job tracking for PDF worker (beats Render 100s load balancer limit)
-- Jobs are created immediately when /process-book receives a request,
-- then processed asynchronously while the client polls /job/:id for status.

-- Safe migration: works with both new and existing ingestion_jobs table

-- (1) Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (2) Add all required columns (idempotent - safe if already exist)
ALTER TABLE public.ingestion_jobs
  ADD COLUMN IF NOT EXISTS book_slug TEXT,
  ADD COLUMN IF NOT EXISTS subject_id UUID,
  ADD COLUMN IF NOT EXISTS grade_id UUID,
  ADD COLUMN IF NOT EXISTS part_number INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pages_uploaded INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chapters_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chapters_done INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_step TEXT,
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS result JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- (3) Add CHECK constraint for status (drop existing if any, then recreate)
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingestion_jobs_status_check'
    AND conrelid = 'public.ingestion_jobs'::regclass
  ) THEN
    ALTER TABLE public.ingestion_jobs DROP CONSTRAINT ingestion_jobs_status_check;
  END IF;

  -- Add constraint
  ALTER TABLE public.ingestion_jobs
    ADD CONSTRAINT ingestion_jobs_status_check
    CHECK (status IN ('queued', 'converting', 'detecting', 'processing', 'done', 'failed'));
END $$;

-- (4) Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_created_at
  ON public.ingestion_jobs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_id
  ON public.ingestion_jobs (id);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status
  ON public.ingestion_jobs (status);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_book_slug
  ON public.ingestion_jobs (book_slug);

-- (5) Enable RLS
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- (6) Drop existing policies if any, then recreate
DROP POLICY IF EXISTS "Service role full access to ingestion_jobs" ON public.ingestion_jobs;
DROP POLICY IF EXISTS "Authenticated users can view ingestion_jobs" ON public.ingestion_jobs;

CREATE POLICY "Service role full access to ingestion_jobs"
  ON public.ingestion_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view ingestion_jobs"
  ON public.ingestion_jobs
  FOR SELECT
  TO authenticated
  USING (true);

-- (7) Grant permissions
GRANT ALL ON public.ingestion_jobs TO service_role;
GRANT SELECT ON public.ingestion_jobs TO authenticated;

-- (8) Add helpful comment
COMMENT ON TABLE public.ingestion_jobs IS
  'Async job tracking for PDF worker. Jobs are processed in background while client polls for status.';

COMMENT ON COLUMN public.ingestion_jobs.status IS
  'Job status: queued → converting → detecting → processing → done/failed';

COMMENT ON COLUMN public.ingestion_jobs.current_step IS
  'Human-readable current operation (e.g., "Converting pages 6-10...")';

COMMENT ON COLUMN public.ingestion_jobs.result IS
  'Final result JSON: {book_slug, total_pages, pages_uploaded, chapters_detected, chapters: [...], gaps: [...], failed_chapters: [...]}';
