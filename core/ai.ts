// core/ai.ts
// واجهة استدعاء دوال الخادم (Edge Functions) من التطبيق:
// - explainLesson: يحوّل نصّ الدرس إلى شرح + سؤال اختبار.
// - searchVideo: يجد فيديو يوتيوب تعليميًّا آمنًا للموضوع.
// تتعامل مع الأخطاء بسلاسة (حالة بديلة) دون انهيار الواجهة.

import { supabase } from './supabase';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LessonExplanation {
  explanation: string;
  keywords: string[];
  quiz: QuizQuestion | null;
}

/**
 * طلب شرح درس من دالّة explain-lesson، مع نبرة مناسبة لعمر الطفل.
 */
export async function explainLesson(
  lessonText: string,
  hakeemTone: string
): Promise<LessonExplanation | null> {
  try {
    const { data, error } = await supabase.functions.invoke('explain-lesson', {
      body: { lessonText, tone: hakeemTone },
    });
    if (error || !data) return null;

    return {
      explanation: data.explanation ?? '',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      quiz:
        data.question && Array.isArray(data.options)
          ? {
              question: data.question,
              options: data.options,
              correctIndex: data.correctIndex ?? 0,
            }
          : null,
    };
  } catch {
    return null;
  }
}

// ===== الحوار الحيّ مع حكيم (tutor-chat) =====

// دور واحد في سجلّ المحادثة (حكيم أو الطفل).
export interface HakeemTurn {
  role: 'hakeem' | 'child';
  text: string;
}

// ردّ حكيم المُهيكل من دالّة الخادم.
export interface HakeemReply {
  // ما يقوله حكيم الآن (سيُنطق صوتيًّا).
  reply: string;
  // تقدير فهم الطفل (دون أسلوب صح/خطأ).
  understanding: 'good' | 'needs_review' | 'starting';
  // المفهوم الفرعي الذي يعالجه حكيم الآن.
  concept: string;
  // هل أتقن الطفل الدرس فاكتمل؟
  lessonComplete: boolean;
  // ردود قصيرة يقترحها حكيم ليختارها الطفل بدل الكتابة.
  suggestChips: string[];
}

/**
 * جولة محادثة مع المعلّم الحواري «حكيم».
 * يمرّر سجلّ المحادثة كاملًا + ردّ الطفل الأخير + سياق الدرس وعمره،
 * ويُرجع ردّ حكيم المُهيكل. يعود null بسلاسة عند أي خلل (لا انهيار).
 *
 * ملاحظة توافق: دالّة الخادم تقرأ الحقول بأسماء lessonText/ageTone/childReply،
 * فنمرّر الأسماء الجديدة والقديمة معًا لضمان العمل دون لبس.
 */
export async function tutorChat(params: {
  subject: string;
  lessonTitle: string;
  lessonContent: string;
  ageTone: string;
  gradeOrder: number;
  childName: string;
  history: HakeemTurn[];
  childMessage: string;
}): Promise<HakeemReply | null> {
  try {
    const { data, error } = await supabase.functions.invoke('tutor-chat', {
      body: {
        // مفتاح المادّة يحدّد دستور حكيم العلمي في الدالّة.
        subject: params.subject,
        lessonTitle: params.lessonTitle,
        // اسمان للمحتوى (الجديد + ما تقرأه الدالّة فعليًّا).
        lessonContent: params.lessonContent,
        lessonText: params.lessonContent,
        ageTone: params.ageTone,
        gradeOrder: params.gradeOrder,
        childName: params.childName,
        history: params.history,
        // اسمان لردّ الطفل (الجديد + ما تقرأه الدالّة فعليًّا).
        childMessage: params.childMessage,
        childReply: params.childMessage,
      },
    });
    if (error || !data || data.error) return null;

    return {
      reply: typeof data.reply === 'string' ? data.reply : '',
      understanding: ['good', 'needs_review', 'starting'].includes(data.understanding)
        ? data.understanding
        : 'starting',
      concept: typeof data.concept === 'string' ? data.concept : '',
      lessonComplete: data.lessonComplete === true,
      suggestChips: Array.isArray(data.suggestChips)
        ? data.suggestChips.slice(0, 3).filter((c: unknown): c is string => typeof c === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

// ===== المعلّم الحواري القائم على RAG (rag-tutor) =====
// يخلف tutorChat: يسترجع مقاطع الدرس متّجهيًّا (معزولة بـ lessonId) ويبني عليها
// ردّ حكيم. يدعم وضع الواجب (isHomework) ونصّ الفيديو (videoTranscript).
// نفس عقد الردّ المُهيكل (HakeemReply) فتعمل بقية الواجهة دون تغيير.

/**
 * جولة محادثة مع المعلّم الحواري القائم على RAG.
 * @param childId   معرّف الطفل (للاستمرارية/الواجب)
 * @param lessonId  معرّف الدرس (عزل تامّ للسياق المسترجَع)
 * @param subject   مفتاح المادّة (لون/هوية حكيم)
 * @param gradeOrder ترتيب الصفّ (نبرة عمرية)
 * @param childMessage آخر ما قاله الطفل
 * @param history   سجلّ المحادثة الكامل
 * @param isHomework إن كانت الجلسة وضع واجب (حكيم يوجّه ولا يحلّ)
 * @param videoTranscript نصّ فيديو الدرس (اختياريّ) يُضاف للسياق
 */
export async function ragTutor(params: {
  childId: string;
  lessonId: string;
  subject: string;
  gradeOrder: number;
  childMessage: string;
  history: HakeemTurn[];
  lessonTitle?: string;
  ageTone?: string;
  childName?: string;
  isHomework?: boolean;
  videoTranscript?: string;
}): Promise<HakeemReply | null> {
  try {
    const { data, error } = await supabase.functions.invoke('rag-tutor', {
      body: {
        childId: params.childId,
        lessonId: params.lessonId,
        subject: params.subject,
        gradeOrder: params.gradeOrder,
        lessonTitle: params.lessonTitle ?? '',
        ageTone: params.ageTone ?? '',
        childName: params.childName ?? 'صديقي',
        history: params.history,
        // اسمان لردّ الطفل (الدالّة تقرأ childReply أو childMessage).
        childMessage: params.childMessage,
        childReply: params.childMessage,
        isHomework: params.isHomework === true,
        videoTranscript: params.videoTranscript ?? '',
      },
    });
    if (error || !data || data.error) return null;

    return {
      reply: typeof data.reply === 'string' ? data.reply : '',
      understanding: ['good', 'needs_review', 'starting'].includes(data.understanding)
        ? data.understanding
        : 'starting',
      concept: typeof data.concept === 'string' ? data.concept : '',
      lessonComplete: data.lessonComplete === true,
      suggestChips: Array.isArray(data.suggestChips)
        ? data.suggestChips.slice(0, 3).filter((c: unknown): c is string => typeof c === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

// ===== بداية جلسة بذاكرة استمرارية (session-start) =====

// نتيجة بداية الجلسة: رسالة استئناف + حالة آخر درس وواجب معلّق.
export interface SessionStart {
  isNew: boolean;
  resumeMessage: string;
  lastLessonId: string | null;
  lastChunkIndex: number | null;
  pendingHomework: boolean;
  sessionSummary: string | null;
}

/**
 * بدء جلسة تعلّم: يقرأ أين توقّف الطفل وهل عليه واجب معلّق،
 * ويُرجع رسالة افتتاحية من حكيم. يعود null بسلاسة عند أي خلل.
 */
export async function sessionStart(
  childId: string,
  subject?: string
): Promise<SessionStart | null> {
  try {
    const { data, error } = await supabase.functions.invoke('session-start', {
      body: { childId, subject: subject ?? '' },
    });
    if (error || !data || data.error) return null;
    return {
      isNew: data.isNew === true,
      resumeMessage: typeof data.resumeMessage === 'string' ? data.resumeMessage : '',
      lastLessonId: data.lastLessonId ?? null,
      lastChunkIndex: typeof data.lastChunkIndex === 'number' ? data.lastChunkIndex : null,
      pendingHomework: data.pendingHomework === true,
      sessionSummary: data.sessionSummary ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * البحث عن فيديو تعليمي آمن (safeSearch) لموضوع الدرس.
 * تُرجع معرّف الفيديو لعرضه في مشغّل يوتيوب المضمّن.
 */
export async function searchVideo(query: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-search', {
      body: { query },
    });
    if (error || !data) return null;
    return data.videoId ?? null;
  } catch {
    return null;
  }
}
