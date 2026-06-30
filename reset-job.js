// إعادة ضبط وظيفة الاستيعاب نظيفاً
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';
const JOB_ID = '3a6aa0ed-c327-43dd-b4ed-c2bc608e21ff';
const SUBJECT_ID = 'cbb340d9-ae4b-4de5-89b0-5572c3a9524d';

// قراءة service_role من .env في الكودسبيس
const envContent = fs.readFileSync('.env', 'utf8');
const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
if (!serviceRoleMatch) {
  console.error('❌ لا يوجد SERVICE_ROLE_KEY في .env');
  process.exit(1);
}
const SERVICE_ROLE_KEY = serviceRoleMatch[1].trim();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function reset() {
  console.log('🧹 حذف كل دروس ومقاطع هذا الكتاب...');

  // حذف المقاطع أولاً (FK constraint)
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('subject_id', SUBJECT_ID);

  if (lessons && lessons.length > 0) {
    const lessonIds = lessons.map(l => l.id);
    const { error: chunksError } = await supabase
      .from('lesson_chunks')
      .delete()
      .in('lesson_id', lessonIds);

    if (chunksError) {
      console.error('❌ فشل حذف المقاطع:', chunksError.message);
    } else {
      console.log('✅ حُذفت المقاطع');
    }

    // حذف الدروس
    const { error: lessonsError } = await supabase
      .from('lessons')
      .delete()
      .eq('subject_id', SUBJECT_ID);

    if (lessonsError) {
      console.error('❌ فشل حذف الدروس:', lessonsError.message);
    } else {
      console.log('✅ حُذفت الدروس');
    }
  } else {
    console.log('⚠️ لا دروس لحذفها');
  }

  // إعادة ضبط الوظيفة
  console.log('\n🔄 إعادة ضبط الوظيفة...');
  const { error: jobError } = await supabase
    .from('ingestion_jobs')
    .update({
      status: 'pending',
      last_page_done: 0,
      lessons_created: 0,
      chunks_created: 0,
      current_lesson_id: null,
      current_chapter_number: null,
      current_chapter_title: null,
    })
    .eq('id', JOB_ID);

  if (jobError) {
    console.error('❌ فشل إعادة ضبط الوظيفة:', jobError.message);
    process.exit(1);
  }

  console.log('✅ الوظيفة مُعادة للبداية');
  console.log('\n🚀 جاهز لبدء المعالجة الكاملة!');
}

reset();
