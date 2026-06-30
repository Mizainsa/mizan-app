// تقرير نهائي كامل من القاعدة
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';
const ANON_KEY = 'sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5';
const SUBJECT_ID = 'cbb340d9-ae4b-4de5-89b0-5572c3a9524d';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function report() {
  console.log('═══════════════════════════════════════════════');
  console.log('      📊 التقرير النهائي: كتاب الرياضيات');
  console.log('═══════════════════════════════════════════════\n');

  // العدد الإجمالي
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', SUBJECT_ID);

  console.log('✅ إجمالي الدروس:', totalLessons);

  // التكرار
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, chapter_number, page_start, lesson_type')
    .eq('subject_id', SUBJECT_ID)
    .order('page_start', { ascending: true });

  const duplicates = {};
  for (const lesson of allLessons || []) {
    const key = `${lesson.title}|${lesson.page_start}|${lesson.lesson_type}`;
    if (!duplicates[key]) duplicates[key] = [];
    duplicates[key].push(lesson);
  }
  const duplicateCount = Object.values(duplicates).filter(g => g.length > 1).length;

  console.log('✅ الدروس المكررة:', duplicateCount > 0 ? `⚠️ ${duplicateCount}` : '0 (بلا تكرار ✓)');

  // الإحصائيات بالنوع
  const intro = allLessons.filter(l => l.lesson_type === 'intro').length;
  const regular = allLessons.filter(l => l.lesson_type === 'lesson').length;
  const testMid = allLessons.filter(l => l.lesson_type === 'test_mid').length;
  const testChapter = allLessons.filter(l => l.lesson_type === 'test_chapter').length;
  const testCumulative = allLessons.filter(l => l.lesson_type === 'test_cumulative').length;

  console.log('\n📚 التوزيع حسب النوع:');
  console.log('  - المقدمات (intro):', intro);
  console.log('  - الدروس (lesson):', regular);
  console.log('  - اختبارات منتصف الفصل:', testMid);
  console.log('  - اختبارات نهاية الفصل:', testChapter);
  console.log('  - اختبارات تراكمية:', testCumulative);

  // الفصول
  const chapters = [...new Set(allLessons.map(l => l.chapter_number).filter(Boolean))].sort((a, b) => a - b);
  console.log('\n📖 الفصول المكتشفة:', chapters.length, '←', chapters.join(', '));

  // المقاطع
  const lessonIds = allLessons.map(l => l.id);
  const { count: totalChunks } = await supabase
    .from('lesson_chunks')
    .select('*', { count: 'exact', head: true })
    .in('lesson_id', lessonIds);

  console.log('\n📦 إجمالي المقاطع (chunks):', totalChunks);
  console.log('    المتوسط لكل درس:', totalLessons > 0 ? Math.round(totalChunks / totalLessons) : 0);

  // القائمة الكاملة
  console.log('\n═══════════════════════════════════════════════');
  console.log('      📋 القائمة الكاملة للدروس');
  console.log('═══════════════════════════════════════════════\n');

  allLessons.forEach((l, idx) => {
    const typeIcon = {
      intro: '🎯',
      lesson: '📘',
      test_mid: '📝',
      test_chapter: '✅',
      test_cumulative: '🏆',
    }[l.lesson_type] || '❓';

    console.log(`${idx + 1}. ${typeIcon} [فصل ${l.chapter_number || '?'}] ${l.title} (ص${l.page_start})`);
  });

  console.log('\n═══════════════════════════════════════════════');
  console.log('           🎯 الخلاصة النهائية');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ معالجة ${totalLessons} درساً من ${chapters.length} فصول`);
  console.log(`✅ توليد ${totalChunks} مقطعاً (vector embeddings بـ768 بُعداً)`);
  console.log(`✅ ${duplicateCount === 0 ? 'لا تكرار - الحل الدائم يعمل ✓' : '⚠️ يوجد تكرار'}`);
  console.log('═══════════════════════════════════════════════\n');
}

report();
