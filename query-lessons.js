// فحص الدروس من القاعدة مباشرة
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';
const ANON_KEY = 'sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5';
const SUBJECT_ID = 'cbb340d9-ae4b-4de5-89b0-5572c3a9524d';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function queryLessons() {
  // عدد الدروس الإجمالي
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', SUBJECT_ID);

  console.log('═══ الدروس الكلية ═══');
  console.log('العدد الإجمالي:', totalLessons);

  // الدروس المكررة (نفس title + page_start + lesson_type)
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, chapter_number, page_start, lesson_type')
    .eq('subject_id', SUBJECT_ID)
    .order('page_start', { ascending: true });

  if (!allLessons) {
    console.log('لا دروس موجودة');
    return;
  }

  // فحص التكرار يدوياً
  const duplicates = {};
  for (const lesson of allLessons) {
    const key = `${lesson.title}|${lesson.page_start}|${lesson.lesson_type}`;
    if (!duplicates[key]) {
      duplicates[key] = [];
    }
    duplicates[key].push(lesson);
  }

  const duplicateGroups = Object.values(duplicates).filter(g => g.length > 1);

  console.log('\n═══ التكرار ═══');
  console.log('مجموعات مكررة:', duplicateGroups.length);

  if (duplicateGroups.length > 0) {
    console.log('\nالدروس المكررة:');
    duplicateGroups.forEach((group, idx) => {
      console.log(`\n${idx + 1}. "${group[0].title}" (ص${group[0].page_start}, ${group[0].lesson_type})`);
      console.log(`   عدد النسخ: ${group.length}`);
      console.log(`   IDs:`, group.map(l => l.id.substr(0, 8)).join(', '));
    });
  }

  // عرض أول 10 دروس
  console.log('\n═══ أول 10 دروس ═══');
  allLessons.slice(0, 10).forEach(l => {
    console.log(`- [${l.lesson_type}] فصل ${l.chapter_number || '?'}: ${l.title} (ص${l.page_start})`);
  });
}

queryLessons();
