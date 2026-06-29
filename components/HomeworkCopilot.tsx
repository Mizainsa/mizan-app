// components/HomeworkCopilot.tsx
// مساعد الواجبات: يظهر بعد إتقان الدرس (lessonComplete). يتيح للطفل أن «يصوّر واجبه»
// أو «يسجّل صوته»، يرفع الملفّ إلى bucket «homework»، ثمّ يفتح حوار توجيه مع حكيم
// عبر ragTutor بوضع الواجب (isHomework=true): يحلّل ويقيّم ويوجّه خطوة بخطوة
// دون إعطاء الحلّ النهائيّ أبدًا. يخزّن كل تسليم في جدول homework_submissions.

import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { supabase } from '../core/supabase';
import { ragTutor, type HakeemTurn } from '../core/ai';
import { theme } from '../config/theme';

interface Props {
  childId: string;
  lessonId: string;
  subject: string;
  gradeOrder: number;
  lessonTitle: string;
  ageTone: string;
  childName: string;
  // لون هوية المادّة (يطابق هالة حكيم في الدرس).
  color: string;
  // سجلّ حوار الدرس حتى الآن (سياق إضافيّ لحكيم).
  baseHistory: HakeemTurn[];
  // إعادة استخدام نطق حكيم (صوت ElevenLabs) من شاشة الدرس.
  speak?: (text: string) => void;
  // يُستدعى مرّة عند أوّل تقييم ناجح للواجب (يفتح مكافأة الألعاب).
  onEvaluated?: () => void;
}

type Phase = 'idle' | 'busy' | 'chat';

// رفع ملفّ محلّي (uri) إلى bucket الواجبات، وإرجاع المسار المخزَّن.
async function uploadToHomework(
  uri: string,
  childId: string,
  ext: string,
  contentType: string
): Promise<string | null> {
  try {
    const buffer = await (await fetch(uri)).arrayBuffer();
    const path = `${childId || 'anon'}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('homework')
      .upload(path, buffer, { contentType, upsert: false });
    if (error) return null;
    return path;
  } catch {
    return null;
  }
}

export default function HomeworkCopilot({
  childId,
  lessonId,
  subject,
  gradeOrder,
  lessonTitle,
  ageTone,
  childName,
  color,
  baseHistory,
  speak,
  onEvaluated,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState(''); // رسالة حالة قصيرة («جارٍ الرفع...»)
  const [reply, setReply] = useState(''); // آخر توجيه من حكيم
  const [chips, setChips] = useState<string[]>([]);
  const [evaluated, setEvaluated] = useState(false);

  // سجلّ حوار الواجب (يُبنى فوق سياق الدرس).
  const hwHistory = useRef<HakeemTurn[]>([]);
  // معرّف صفّ التسليم الحاليّ (لتحديث التقييم لاحقًا).
  const submissionId = useRef<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);

  // جولة توجيه مع حكيم بوضع الواجب.
  const askHakeem = useCallback(
    async (childMessage: string) => {
      const history = [...baseHistory, ...hwHistory.current];
      hwHistory.current = [...hwHistory.current, { role: 'child', text: childMessage }];
      setPhase('busy');
      setStatus('حكيم يراجع واجبك...');
      const res = await ragTutor({
        childId,
        lessonId,
        subject,
        gradeOrder,
        lessonTitle,
        ageTone,
        childName,
        history,
        childMessage,
        isHomework: true,
      });
      setStatus('');
      if (res && res.reply) {
        hwHistory.current = [...hwHistory.current, { role: 'hakeem', text: res.reply }];
        setReply(res.reply);
        setChips(res.suggestChips);
        setPhase('chat');
        if (speak) speak(res.reply);
        // نخزّن آخر توجيه كتقييم حاليّ للتسليم.
        if (submissionId.current) {
          supabase
            .from('homework_submissions')
            .update({ evaluation: res.reply })
            .eq('id', submissionId.current)
            .then(() => {});
        }
        if (!evaluated) onEvaluated?.();
        setEvaluated(true);
      } else {
        setReply('صار عندي عطل بسيط يا بطل، حاول مرّة ثانية.');
        setPhase('chat');
      }
    },
    [baseHistory, childId, lessonId, subject, gradeOrder, lessonTitle, ageTone, childName, speak, evaluated, onEvaluated]
  );

  // تسجيل صفّ تسليم جديد في قاعدة البيانات.
  const recordSubmission = useCallback(
    async (type: 'image' | 'audio', url: string | null) => {
      try {
        const { data } = await supabase
          .from('homework_submissions')
          .insert({
            child_id: childId,
            lesson_id: lessonId || null,
            submission_type: type,
            submission_url: url,
          })
          .select('id')
          .single();
        submissionId.current = (data as { id: string } | null)?.id ?? null;
      } catch {
        submissionId.current = null;
      }
    },
    [childId, lessonId]
  );

  // ===== صوّر واجبك =====
  const onPhoto = useCallback(async () => {
    try {
      setPhase('busy');
      setStatus('نفتح الكاميرا...');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      let result;
      if (perm.granted) {
        result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      } else {
        // لا إذن كاميرا → نسمح باختيار صورة من المعرض بدل التعطّل.
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) {
          setStatus('نحتاج إذن الكاميرا لتصوير الواجب.');
          setPhase('idle');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
      }
      if (result.canceled || !result.assets?.[0]?.uri) {
        setStatus('');
        setPhase('idle');
        return;
      }
      setStatus('جارٍ رفع الصورة...');
      const path = await uploadToHomework(result.assets[0].uri, childId, 'jpg', 'image/jpeg');
      await recordSubmission('image', path);
      await askHakeem(
        'صوّرت لك واجبي. ساعدني أفهم خطواته وقيّم محاولتي خطوة بخطوة، بدون ما تعطيني الحلّ النهائيّ.'
      );
    } catch {
      setStatus('صار خطأ في التصوير، حاول مرّة ثانية.');
      setPhase('idle');
    }
  }, [childId, recordSubmission, askHakeem]);

  // ===== سجّل صوتك =====
  const onAudioToggle = useCallback(async () => {
    try {
      if (!recording) {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          setStatus('نحتاج إذن المايكروفون لتسجيل صوتك.');
          return;
        }
        try {
          await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        } catch {
          // ليس حرجًا.
        }
        await recorder.prepareToRecordAsync();
        recorder.record();
        setRecording(true);
        setStatus('سجّل سؤالك الآن... المس مرّة ثانية للإنهاء.');
        return;
      }
      // إيقاف التسجيل والرفع.
      setRecording(false);
      setPhase('busy');
      setStatus('جارٍ رفع التسجيل...');
      await recorder.stop();
      const uri = recorder.uri;
      const path = uri ? await uploadToHomework(uri, childId, 'm4a', 'audio/m4a') : null;
      await recordSubmission('audio', path);
      await askHakeem(
        'سجّلت لك سؤال واجبي بصوتي. ساعدني خطوة بخطوة وقيّم محاولتي، بدون ما تعطيني الحلّ النهائيّ.'
      );
    } catch {
      setRecording(false);
      setStatus('صار خطأ في التسجيل، حاول مرّة ثانية.');
      setPhase('idle');
    }
  }, [recording, recorder, childId, recordSubmission, askHakeem]);

  return (
    <View style={[s.wrap, { borderColor: color }]}>
      <Text style={[s.title, { color }]}>📚 مساعد الواجبات</Text>

      {/* توجيه حكيم خطوة بخطوة */}
      {!!reply && (
        <ScrollView style={s.replyBox} contentContainerStyle={s.replyContent} nestedScrollEnabled>
          <Text style={s.replyText}>{reply}</Text>
        </ScrollView>
      )}

      {/* حالة العمل */}
      {phase === 'busy' && (
        <View style={s.statusRow}>
          <ActivityIndicator size="small" color={color} />
          {!!status && <Text style={s.statusText}>{status}</Text>}
        </View>
      )}
      {phase !== 'busy' && !!status && <Text style={s.statusText}>{status}</Text>}

      {/* بطاقات متابعة الحوار (بعد أوّل توجيه) */}
      {phase === 'chat' && chips.length > 0 && (
        <View style={s.chipsWrap}>
          {chips.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={[s.chip, { borderColor: color }]}
              onPress={() => askHakeem(c)}
              activeOpacity={0.8}
            >
              <Text style={s.chipText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* الزرّان الكبيران */}
      <View style={s.btnRow}>
        <TouchableOpacity
          style={[s.bigBtn, { backgroundColor: color }]}
          onPress={onPhoto}
          disabled={phase === 'busy'}
          activeOpacity={0.85}
        >
          <Text style={s.bigBtnIcon}>📷</Text>
          <Text style={s.bigBtnText}>صوّر واجبك</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.bigBtn, { backgroundColor: recording ? theme.colors.error : color }]}
          onPress={onAudioToggle}
          disabled={phase === 'busy' && !recording}
          activeOpacity={0.85}
        >
          <Text style={s.bigBtnIcon}>{recording ? '⏹️' : '🎙️'}</Text>
          <Text style={s.bigBtnText}>{recording ? 'إنهاء التسجيل' : 'سجّل صوتك'}</Text>
        </TouchableOpacity>
      </View>

      {evaluated && (
        <Text style={s.hint}>حكيم يوجّهك ولا يحلّ عنك — جرّب بنفسك ثم ورّيه! 💪</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 2.5,
    padding: 16,
    gap: 12,
  },
  title: { fontFamily: theme.fonts.heading, fontSize: 18, textAlign: 'center' },
  replyBox: { maxHeight: 160, alignSelf: 'stretch' },
  replyContent: { padding: 4 },
  replyText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 16,
    color: theme.colors.textBody,
    lineHeight: 28,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  statusText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  chip: {
    minHeight: 52,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: theme.fonts.bodyBold, fontSize: 16, color: theme.colors.textDark, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  bigBtn: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bigBtnIcon: { fontSize: 30 },
  bigBtnText: { fontFamily: theme.fonts.headingMed, fontSize: 16, color: theme.colors.white },
  hint: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
