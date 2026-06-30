// فحص بسيط لحالة الوظيفة
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';
const ANON_KEY = 'sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5';
const jobId = '3a6aa0ed-c327-43dd-b4ed-c2bc608e21ff';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function check() {
  const { data: job } = await supabase
    .from('ingestion_jobs')
    .select('status, last_page_done, total_pages, lessons_created, chunks_created')
    .eq('id', jobId)
    .single();

  console.log('═══ حالة الوظيفة ═══');
  console.log('الحالة:', job.status);
  console.log('الصفحات:', `${job.last_page_done}/${job.total_pages}`);
  console.log('الدروس:', job.lessons_created);
  console.log('المقاطع:', job.chunks_created);

  const { count: lessonsCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', 'cbb340d9-ae4b-4de5-89b0-5572c3a9524d');

  console.log('\n═══ من القاعدة فعلياً ═══');
  console.log('الدروس في القاعدة:', lessonsCount);
}

check();
