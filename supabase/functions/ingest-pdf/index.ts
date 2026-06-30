// supabase/functions/ingest-pdf/index.ts
// استيعاب درس واحد أو كتاب كامل في قاعدة RAG.
// mode='lesson': يستوعب درساً واحداً (كما كان سابقاً)
// mode='book': يقسم الكتاب تلقائياً لدروس واختبارات (regex + Gemini احتياطي)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EMBED_MODEL = 'gemini-embedding-001';
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 150;
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

// ===== مساعدات مشتركة =====

function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let i = 0;
  const step = Math.max(1, CHUNK_SIZE - CHUNK_OVERLAP);
  while (i < clean.length) {
    const piece = clean.slice(i, i + CHUNK_SIZE).trim();
    if (piece) chunks.push(piece);
    i += step;
  }
  return chunks;
}

async function embed(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/' +
      EMBED_MODEL +
      ':embedContent?key=' +
      apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/' + EMBED_MODEL,
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );
  if (!res.ok) throw new Error('فشل توليد embedding: ' + (await res.text()));
  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values)) throw new Error('ردّ embedding بلا قيم');
  return values;
}

// ===== استخراج النص من PDF صفحة صفحة =====
interface PageText {
  pageNumber: number;
  text: string;
}

async function extractPdfPages(fileUrl: string): Promise<PageText[]> {
  const { extractText, getDocumentProxy } = await import('https://esm.sh/unpdf');
  const buf = new Uint8Array(await (await fetch(fileUrl)).arrayBuffer());
  const pdf = await getDocumentProxy(buf);
  const totalPages = pdf.numPages;
  const pages: PageText[] = [];

  for (let p = 1; p <= totalPages; p++) {
    const pageResult = await extractText(pdf, { mergePages: false, pages: [p] });
    const pageText = Array.isArray(pageResult.text)
      ? pageResult.text.join('\n')
      : String(pageResult.text || '');
    pages.push({ pageNumber: p, text: pageText });
  }
  return pages;
}

// ===== كشف الدروس بregex =====
interface DetectedLesson {
  title: string;
  lesson_type: 'lesson' | 'test_mid' | 'test_chapter' | 'test_cumulative' | 'intro';
  chapter_number: number | null;
  chapter_title: string | null;
  page_start: number;
  page_end: number | null;
  lesson_order: number;
}

function detectLessonsRegex(pages: PageText[]): DetectedLesson[] {
  const lessons: DetectedLesson[] = [];
  let currentChapter = { number: 0, title: '' };
  let orderCounter = 1;

  // أنماط الكشف
  const chapterPattern = /الفصل\s+(\d+)\s*[:：]\s*(.+)/;
  const lessonPattern = /الدرس\s+(\d+)\s*[:：]\s*(.+)/;
  const testMidPattern = /اختبار\s+منتصف\s+الفصل/;
  const testChapterPattern = /اختبار\s+الفصل/;
  const testCumulativePattern = /الاختبار\s+التراكمي/;
  const introPattern = /الفصل\s+[:：]\s*التهيئة/;

  for (const page of pages) {
    const text = page.text;

    // كشف الفصل
    const chapterMatch = text.match(chapterPattern);
    if (chapterMatch) {
      currentChapter = {
        number: parseInt(chapterMatch[1]),
        title: chapterMatch[2].trim(),
      };
    }

    // كشف التهيئة
    if (introPattern.test(text)) {
      lessons.push({
        title: `${currentChapter.title} - التهيئة`,
        lesson_type: 'intro',
        chapter_number: currentChapter.number,
        chapter_title: currentChapter.title,
        page_start: page.pageNumber,
        page_end: null,
        lesson_order: orderCounter++,
      });
      continue;
    }

    // كشف الاختبارات
    if (testMidPattern.test(text)) {
      lessons.push({
        title: `اختبار منتصف الفصل ${currentChapter.number}`,
        lesson_type: 'test_mid',
        chapter_number: currentChapter.number,
        chapter_title: currentChapter.title,
        page_start: page.pageNumber,
        page_end: null,
        lesson_order: orderCounter++,
      });
      continue;
    }

    if (testChapterPattern.test(text)) {
      lessons.push({
        title: `اختبار الفصل ${currentChapter.number}`,
        lesson_type: 'test_chapter',
        chapter_number: currentChapter.number,
        chapter_title: currentChapter.title,
        page_start: page.pageNumber,
        page_end: null,
        lesson_order: orderCounter++,
      });
      continue;
    }

    if (testCumulativePattern.test(text)) {
      lessons.push({
        title: `الاختبار التراكمي`,
        lesson_type: 'test_cumulative',
        chapter_number: currentChapter.number,
        chapter_title: currentChapter.title,
        page_start: page.pageNumber,
        page_end: null,
        lesson_order: orderCounter++,
      });
      continue;
    }

    // كشف الدروس
    const lessonMatch = text.match(lessonPattern);
    if (lessonMatch) {
      lessons.push({
        title: lessonMatch[2].trim(),
        lesson_type: 'lesson',
        chapter_number: currentChapter.number,
        chapter_title: currentChapter.title,
        page_start: page.pageNumber,
        page_end: null,
        lesson_order: orderCounter++,
      });
    }
  }

  // تحديد page_end لكل درس
  for (let i = 0; i < lessons.length; i++) {
    if (i + 1 < lessons.length) {
      lessons[i].page_end = lessons[i + 1].page_start - 1;
    } else {
      lessons[i].page_end = pages[pages.length - 1].pageNumber;
    }
  }

  return lessons;
}

// ===== كشف بGemini (احتياطي) =====
async function detectLessonsGemini(
  pages: PageText[],
  apiKey: string
): Promise<DetectedLesson[]> {
  const fullText = pages.map((p) => `[ص${p.pageNumber}]\n${p.text}`).join('\n\n');
  const prompt = `أنت نظام تحليل كتب مدرسية. حلل النص التالي من كتاب رياضيات وأرجع JSON صارم بقائمة الفصول والدروس والاختبارات.

الصيغة المطلوبة:
{
  "lessons": [
    {
      "title": "عنوان الدرس",
      "lesson_type": "lesson" أو "test_mid" أو "test_chapter" أو "test_cumulative" أو "intro",
      "chapter_number": رقم الفصل,
      "chapter_title": "عنوان الفصل",
      "page_start": رقم صفحة البداية,
      "page_end": رقم صفحة النهاية
    }
  ]
}

النص:
${fullText.slice(0, 30000)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );

  if (!res.ok) throw new Error('فشل Gemini: ' + (await res.text()));
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini لم يرجع JSON صالح');

  const parsed = JSON.parse(jsonMatch[0]);
  const lessons = parsed.lessons || [];

  // إضافة lesson_order
  return lessons.map((l: any, idx: number) => ({
    ...l,
    lesson_order: idx + 1,
  }));
}

// ===== استيعاب درس واحد =====
async function ingestLesson(params: {
  supabase: any;
  geminiKey: string;
  lessonId: string;
  subject: string;
  gradeOrder: number;
  partNumber: number;
  pageTexts: PageText[];
  pageStart: number;
  pageEnd: number;
}): Promise<number> {
  const { supabase, geminiKey, lessonId, subject, gradeOrder, partNumber, pageTexts, pageStart, pageEnd } = params;

  // استخراج نص الدرس من الصفحات المحددة
  const lessonPages = pageTexts.filter(
    (p) => p.pageNumber >= pageStart && p.pageNumber <= pageEnd
  );

  interface PagedChunk {
    text: string;
    pageNumber: number;
  }
  const pagedChunks: PagedChunk[] = [];

  for (const page of lessonPages) {
    if (page.text.trim()) {
      const pageChunks = chunkText(page.text);
      for (const chunk of pageChunks) {
        pagedChunks.push({ text: chunk, pageNumber: page.pageNumber });
      }
    }
  }

  if (pagedChunks.length === 0) return 0;

  // حذف مقاطع سابقة
  await supabase.from('lesson_chunks').delete().eq('lesson_id', lessonId);

  // إنشاء embeddings وحفظها
  const rows: Record<string, unknown>[] = [];
  for (let idx = 0; idx < pagedChunks.length; idx++) {
    const { text: chunkText, pageNumber } = pagedChunks[idx];
    const embedding = await embed(chunkText, geminiKey);
    rows.push({
      lesson_id: lessonId,
      subject,
      grade_order: gradeOrder,
      chunk_index: idx,
      content: chunkText,
      page_number: pageNumber,
      part_number: partNumber,
      embedding,
    });
  }

  const { error: insErr } = await supabase.from('lesson_chunks').insert(rows);
  if (insErr) throw new Error('فشل تخزين المقاطع: ' + insErr.message);

  return rows.length;
}

// ===== المعالج الرئيسي =====
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode: string = body.mode || 'lesson'; // 'lesson' أو 'book'

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey =
      Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!geminiKey) return json({ error: 'GEMINI_API_KEY غير مضبوط' }, 500);
    if (!supabaseUrl || !serviceKey) return json({ error: 'إعداد Supabase ناقص' }, 500);

    const supabase = createClient(supabaseUrl, serviceKey);

    // ===== Mode: book (تقسيم تلقائي) =====
    if (mode === 'book') {
      const fileUrl: string = body.fileUrl || '';
      const subject_id: string = body.subject_id || '';
      const grade_id: string = body.grade_id || '';
      const partNumber: number = Number(body.partNumber) || 1;
      const subject: string = body.subject || '';
      const gradeOrder: number = Number(body.gradeOrder) || 0;

      if (!fileUrl) return json({ error: 'fileUrl مطلوب في وضع book' }, 400);
      if (!subject_id) return json({ error: 'subject_id مطلوب' }, 400);

      // استخراج الصفحات
      const pages = await extractPdfPages(fileUrl);
      if (pages.length === 0) return json({ error: 'needs_ocr', message: 'PDF فارغ من النص' }, 400);

      // كشف الدروس بregex
      let detected = detectLessonsRegex(pages);

      // إن فشل regex (أقل من 3 دروس)، استخدم Gemini
      if (detected.length < 3) {
        detected = await detectLessonsGemini(pages, geminiKey);
      }

      // إنشاء سجلات lessons واستيعاب كل درس
      const createdLessons: string[] = [];
      let totalChunks = 0;

      for (const lesson of detected) {
        // إنشاء سجل الدرس
        const { data: newLesson, error: lessonErr } = await supabase
          .from('lessons')
          .insert({
            subject_id,
            grade_id,
            title: lesson.title,
            part_number: partNumber,
            lesson_order: lesson.lesson_order,
            chapter_number: lesson.chapter_number,
            chapter_title: lesson.chapter_title,
            lesson_type: lesson.lesson_type,
            page_start: lesson.page_start,
            page_end: lesson.page_end,
            status: 'processed',
          })
          .select('id')
          .single();

        if (lessonErr) throw new Error('فشل إنشاء درس: ' + lessonErr.message);

        const lessonId = newLesson.id;
        createdLessons.push(lesson.title);

        // استيعاب الدرس
        const chunks = await ingestLesson({
          supabase,
          geminiKey,
          lessonId,
          subject,
          gradeOrder,
          partNumber,
          pageTexts: pages,
          pageStart: lesson.page_start,
          pageEnd: lesson.page_end || pages[pages.length - 1].pageNumber,
        });

        totalChunks += chunks;
      }

      // ملخص النتيجة
      const summary = {
        ok: true,
        mode: 'book',
        totalPages: pages.length,
        totalLessons: detected.length,
        chapters: [...new Set(detected.map((l) => l.chapter_number))].length,
        tests: detected.filter((l) => l.lesson_type.startsWith('test')).length,
        totalChunks,
        lessons: createdLessons,
      };

      return json(summary);
    }

    // ===== Mode: lesson (استيعاب درس واحد — كما كان سابقاً) =====
    const lessonId: string = body.lessonId || '';
    const subject: string = body.subject || '';
    const gradeOrder: number = Number(body.gradeOrder) || 0;
    const partNumber: number = Number(body.partNumber) || 1;
    const fileUrl: string = body.fileUrl || '';
    let text: string = body.text || '';

    if (!lessonId) return json({ error: 'lessonId مطلوب' }, 400);

    interface PagedChunk {
      text: string;
      pageNumber: number | null;
    }
    const pagedChunks: PagedChunk[] = [];

    if (fileUrl) {
      const pages = await extractPdfPages(fileUrl);
      for (const page of pages) {
        if (page.text.trim()) {
          const pageChunks = chunkText(page.text);
          for (const chunk of pageChunks) {
            pagedChunks.push({ text: chunk, pageNumber: page.pageNumber });
          }
        }
      }
    } else if (text) {
      const simpleChunks = chunkText(text);
      for (const chunk of simpleChunks) {
        pagedChunks.push({ text: chunk, pageNumber: null });
      }
    } else {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('content_text')
        .eq('id', lessonId)
        .single();
      const lessonText = lesson?.content_text || '';
      if (lessonText.trim()) {
        const simpleChunks = chunkText(lessonText);
        for (const chunk of simpleChunks) {
          pagedChunks.push({ text: chunk, pageNumber: null });
        }
      }
    }

    if (pagedChunks.length === 0) return json({ error: 'لا يوجد نصّ للاستيعاب' }, 400);

    await supabase.from('lesson_chunks').delete().eq('lesson_id', lessonId);

    const rows: Record<string, unknown>[] = [];
    for (let idx = 0; idx < pagedChunks.length; idx++) {
      const { text: chunkText, pageNumber } = pagedChunks[idx];
      const embedding = await embed(chunkText, geminiKey);
      rows.push({
        lesson_id: lessonId,
        subject,
        grade_order: gradeOrder,
        chunk_index: idx,
        content: chunkText,
        page_number: pageNumber,
        part_number: partNumber,
        embedding,
      });
    }

    const { error: insErr } = await supabase.from('lesson_chunks').insert(rows);
    if (insErr) return json({ error: 'فشل تخزين المقاطع', detail: insErr.message }, 500);

    return json({ ok: true, mode: 'lesson', lessonId, chunks: rows.length });
  } catch (err: any) {
    return json({ error: String(err?.message || err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
