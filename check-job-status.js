// Check job status and lessons
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';
const jobId = '3a6aa0ed-2d2a-4e41-95e3-c78a603c5f7a';

async function checkStatus() {
  // Read service role key from .env
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  if (!serviceRoleMatch) {
    console.error('❌ لا يوجد SUPABASE_SERVICE_ROLE_KEY في .env');
    process.exit(1);
  }
  const SERVICE_ROLE_KEY = serviceRoleMatch[1].trim();

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Check job status
  const { data: job, error: jobError } = await supabase
    .from('ingestion_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError) {
    console.error('❌ خطأ في قراءة المهمة:', jobError.message);
    return;
  }

  console.log('\n=== حالة المهمة ===');
  console.log('الحالة:', job.status);
  console.log('إجمالي الصفحات:', job.total_pages);
  console.log('آخر صفحة منتهية:', job.last_page_done);
  console.log('الدروس المنشأة:', job.lessons_created);
  console.log('المقاطع المنشأة:', job.chunks_created);
  console.log('الفصل الحالي:', job.current_chapter_number, '-', job.current_chapter_title);

  // Check actual lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, lesson_type, chapter_number, chapter_title, page_start, lesson_order')
    .eq('subject_id', job.subject_id)
    .eq('grade_id', job.grade_id)
    .order('lesson_order', { ascending: true });

  if (lessonsError) {
    console.error('❌ خطأ في قراءة الدروس:', lessonsError.message);
    return;
  }

  console.log('\n=== الدروس المنشأة فعلياً ===');
  console.log('العدد:', lessons.length);

  if (lessons.length > 0) {
    console.log('\nالقائمة:');
    lessons.forEach(lesson => {
      console.log(`- [${lesson.lesson_type}] فصل ${lesson.chapter_number}: ${lesson.title} (ص${lesson.page_start})`);
    });
  }

  // Count by type
  const intro = lessons.filter(l => l.lesson_type === 'intro').length;
  const regular = lessons.filter(l => l.lesson_type === 'lesson').length;
  const testMid = lessons.filter(l => l.lesson_type === 'test_mid').length;
  const testChapter = lessons.filter(l => l.lesson_type === 'test_chapter').length;
  const testCumulative = lessons.filter(l => l.lesson_type === 'test_cumulative').length;

  console.log('\n=== الإحصائيات ===');
  console.log('المقدمات:', intro);
  console.log('الدروس:', regular);
  console.log('اختبارات منتصف الفصل:', testMid);
  console.log('اختبارات نهاية الفصل:', testChapter);
  console.log('اختبارات تراكمية:', testCumulative);

  // Check chunks
  const { count: chunksCount } = await supabase
    .from('lesson_chunks')
    .select('*', { count: 'exact', head: true })
    .in('lesson_id', lessons.map(l => l.id));

  console.log('المقاطع المرتبطة:', chunksCount);
}

checkStatus().catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
