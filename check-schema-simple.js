const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';

const envContent = fs.readFileSync('.env', 'utf8');
const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
const SERVICE_ROLE_KEY = serviceRoleMatch[1].trim();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('=== فحص جدول subjects ===');

  // قراءة subject موجود لمعرفة أعمدته
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .limit(1);

  if (subjects && subjects.length > 0) {
    console.log('أعمدة subjects:');
    Object.keys(subjects[0]).forEach(key => {
      console.log('  -', key);
    });
    console.log('\nهل subjects.grade_id موجود؟', 'grade_id' in subjects[0] ? 'نعم ✓' : 'لا ✗');
  }

  console.log('\n=== فحص جدول lessons ===');

  // قراءة lesson موجود
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .limit(1);

  if (lessons && lessons.length > 0) {
    console.log('أعمدة lessons:');
    Object.keys(lessons[0]).forEach(key => {
      console.log('  -', key);
    });
    console.log('\nهل lessons.grade_id موجود؟', 'grade_id' in lessons[0] ? 'نعم ✓' : 'لا ✗');
  } else {
    console.log('(لا دروس موجودة - سأحاول إدراج درس بدون grade_id)');

    const { data: job } = await supabase
      .from('ingestion_jobs')
      .select('subject_id')
      .eq('id', '3a6aa0ed-c327-43dd-b4ed-c2bc608e21ff')
      .single();

    // محاولة إدراج بدون grade_id
    const { data: test, error } = await supabase
      .from('lessons')
      .insert({
        subject_id: job.subject_id,
        title: 'اختبار بنية',
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      console.error('\nخطأ في الإدراج:', error.message);
    } else if (test) {
      console.log('\n✅ نجح الإدراج بدون grade_id!');
      console.log('أعمدة lessons:');
      Object.keys(test).forEach(key => {
        console.log('  -', key);
      });

      // حذف الدرس التجريبي
      await supabase.from('lessons').delete().eq('id', test.id);
      console.log('(حُذف الدرس التجريبي)');
    }
  }
}

checkSchema().catch(err => console.error('خطأ:', err.message));
