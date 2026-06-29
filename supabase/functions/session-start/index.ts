// supabase/functions/session-start/index.ts
// بداية جلسة تعلّم بذاكرة استمرارية: تقرأ learning_sessions لطفل في مادّة،
// فتعرف أين توقّف (الدرس والمقطع) وهل عليه واجب معلّق، وتُرجع رسالة افتتاحية
// من حكيم تستأنف من حيث توقّف وتسأل عن الواجب إن وُجد.
//
// المفاتيح المطلوبة: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const childId: string = body.childId || '';
    const subject: string = body.subject || '';
    if (!childId) return json({ error: 'childId مطلوب' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return json({ error: 'إعداد Supabase ناقص في الخادم' }, 500);

    const supabase = createClient(supabaseUrl, serviceKey);

    // اسم الطفل لنبرة شخصية.
    const { data: child } = await supabase
      .from('children')
      .select('name')
      .eq('id', childId)
      .single();
    const name = child?.name || 'صديقي';

    // آخر جلسة لهذا الطفل (في المادّة إن حُدِّدت).
    let query = supabase
      .from('learning_sessions')
      .select('*')
      .eq('child_id', childId)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (subject) query = query.eq('subject', subject);
    const { data: sessions } = await query;
    const session = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;

    // لا جلسة سابقة: بداية جديدة.
    if (!session) {
      return json({
        isNew: true,
        resumeMessage: `أهلًا ${name}! جاهز نبدأ رحلة جديدة سوا؟`,
        lastLessonId: null,
        lastChunkIndex: null,
        pendingHomework: false,
        sessionSummary: null,
      });
    }

    // عنوان آخر درس (إن وُجد) لاستئناف ألطف.
    let lastTitle = '';
    if (session.last_lesson_id) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title')
        .eq('id', session.last_lesson_id)
        .single();
      lastTitle = lesson?.title || '';
    }

    // صياغة رسالة الاستئناف (+ سؤال الواجب إن كان معلّقًا).
    let resumeMessage: string;
    if (session.pending_homework) {
      resumeMessage = lastTitle
        ? `هلا ${name}! خلّصت واجب درس «${lastTitle}»؟ ورّيني وأساعدك.`
        : `هلا ${name}! خلّصت واجبك؟ ورّيني وأساعدك.`;
    } else if (lastTitle) {
      resumeMessage = `أهلًا ${name}! نكمّل من حيث وقفنا في «${lastTitle}»؟`;
    } else {
      resumeMessage = `أهلًا ${name}! نكمّل رحلتنا؟`;
    }

    return json({
      isNew: false,
      resumeMessage,
      lastLessonId: session.last_lesson_id ?? null,
      lastChunkIndex: session.last_chunk_index ?? null,
      pendingHomework: session.pending_homework === true,
      sessionSummary: session.session_summary ?? null,
    });
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
