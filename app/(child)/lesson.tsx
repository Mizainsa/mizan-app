// app/(child)/lesson.tsx
// شاشة الدرس: تجلب نصّ الدرس، تطلب شرحًا من الذكاء بنبرة عمر الطفل،
// تعرض فيديو يوتيوب تعليميًّا آمنًا، وحكيم الحيّ يشرح. زرّ للاختبار.

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Hakeem from '../../components/Hakeem';
import { supabase } from '../../core/supabase';
import type { Lesson, Child } from '../../core/supabase';
import { explainLesson, searchVideo, type QuizQuestion } from '../../core/ai';
import { getAgeProfile } from '../../config/ageProfiles';
import { theme } from '../../config/theme';

export default function LessonScreen() {
  const router = useRouter();
  const { childId, lessonId } = useLocalSearchParams<{ childId: string; lessonId: string }>();

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [fontScale, setFontScale] = useState(1.1);

  useEffect(() => {
    (async () => {
      if (!lessonId) return;

      // جلب الدرس.
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      const ls = lessonData as Lesson | null;
      setLesson(ls);

      // جلب صفّ الطفل لتحديد نبرة حكيم وحجم الخطّ.
      let tone = '';
      if (childId) {
        const { data: childData } = await supabase
          .from('children')
          .select('grade_id')
          .eq('id', childId)
          .single();
        const child = childData as Partial<Child> | null;
        if (child?.grade_id) {
          const { data: gradeData } = await supabase
            .from('grades')
            .select('sort_order')
            .eq('id', child.grade_id)
            .single();
          const profile = getAgeProfile(gradeData?.sort_order);
          tone = profile.hakeemTone;
          setFontScale(profile.fontScale);
        }
      }

      // شرح الذكاء + فيديو (بالتوازي).
      if (ls?.content_text) {
        const [exp, vid] = await Promise.all([
          explainLesson(ls.content_text, tone),
          searchVideo(`شرح ${ls.title} للأطفال`),
        ]);
        if (exp) {
          setExplanation(exp.explanation);
          setQuiz(exp.quiz);
        } else {
          // حالة بديلة: عرض نصّ الدرس نفسه إن تعذّر الذكاء.
          setExplanation(ls.content_text);
        }
        setVideoId(vid);
      }
      setLoading(false);
    })();
  }, [lessonId, childId]);

  const goToQuiz = () => {
    router.push({
      pathname: '/(child)/quiz',
      params: {
        childId,
        lessonId,
        // نمرّر السؤال عبر التنقّل (إن وُجد).
        quiz: quiz ? JSON.stringify(quiz) : '',
      },
    });
  };

  if (loading) {
    return (
      <View style={s.center}>
        <Hakeem mood="think" size={120} />
        <Text style={s.loadingText}>حكيم يجهّز لك الدرس...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>↩</Text>
        </TouchableOpacity>
        <Text style={s.title}>{lesson?.title ?? 'الدرس'}</Text>
      </View>

      {/* الفيديو */}
      <View style={s.videoBox}>
        {videoId ? (
          <Text style={s.videoReady}>▶ فيديو الشرح جاهز</Text>
        ) : (
          <Text style={s.videoNone}>لا يوجد فيديو متاح حاليًّا</Text>
        )}
      </View>

      {/* حكيم + الشرح */}
      <View style={s.hakeemSection}>
        <Hakeem mood="happy" size={110} />
        <View style={s.bubble}>
          <Text style={[s.bubbleText, { fontSize: 15 * fontScale }]}>
            {explanation || 'سنتعلّم هذا الدرس معًا خطوة بخطوة!'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={s.quizBtn} onPress={goToQuiz}>
        <Text style={s.quizBtnText}>جاهز للاختبار؟</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, gap: 14 },
  loadingText: { fontFamily: theme.fonts.bodyBold, fontSize: 15, color: theme.colors.textBody },
  container: { padding: theme.spacing.md, paddingTop: 54, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 19, color: theme.colors.primaryDark },
  title: { fontFamily: theme.fonts.heading, fontSize: 20, color: theme.colors.textDark },
  videoBox: { height: 150, borderRadius: theme.radius.md, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  videoReady: { color: theme.colors.white, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
  videoNone: { color: 'rgba(255,255,255,0.6)', fontFamily: theme.fonts.body, fontSize: 13 },
  hakeemSection: { alignItems: 'center', marginBottom: 18 },
  bubble: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: 16, marginTop: 10 },
  bubbleText: { fontFamily: theme.fonts.bodyMed, color: theme.colors.textBody, lineHeight: 26, textAlign: 'center' },
  quizBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: 16, alignItems: 'center' },
  quizBtnText: { fontFamily: theme.fonts.headingMed, fontSize: 16, color: theme.colors.white },
});
