import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

const SECTIONS = [
  { h: '١. طبيعة الخدمة', p: 'ميزان أداة توعية استرشادية تقدّم معلومات وإرشادات عامّة ذات طابع توعوي بحت، بهدف تقريب فهم الإجراءات للمستخدم. ميزان ليس جهة حكومية أو رسمية، وليس مكتباً للمحاماة أو الاستشارات، ولا يمثّل أي جهة رسمية أو ينوب عنها.' },
  { h: '٢. المحتوى مولّد بالذكاء الاصطناعي', p: 'تُولَّد ردود ميزان عبر أنظمة ذكاء اصطناعي. ورغم سعيه للدقّة، فإنّ هذه الأنظمة قد تُخطئ أو تقدّم معلومات غير دقيقة أو غير مكتملة أو غير محدّثة. لذا يجب التعامل مع كل ردّ باعتباره معلومة استرشادية أوّلية تحتاج تحقّقاً، لا حقيقة نهائية.' },
  { h: '٣. لا يقدّم استشارة ولا رأياً ملزماً', p: 'المحتوى المقدّم عبر ميزان لا يُعدّ استشارة قانونية أو مالية أو مهنية، ولا رأياً قانونيّاً، ولا توجيهاً ملزماً. ولا تنشأ بين المستخدم وميزان أي علاقة مهنية أو تعاقدية من أي نوع.' },
  { h: '٤. لا ضمان للدقّة أو الاكتمال', p: 'تُقدَّم المعلومات «كما هي» دون أي ضمان لدقّتها أو اكتمالها أو حداثتها. وقد تتغيّر الأنظمة والإجراءات والرسوم والمُدد في أي وقت، ولا يتحمّل ميزان مسؤولية أي معلومة أصبحت غير دقيقة أو متجاوزة.' },
  { h: '٥. مسؤولية المستخدم في التحقّق', p: 'يقع على المستخدم وحده مسؤولية التحقّق من أي معلومة من مصدرها الرسمي المختصّ قبل اتّخاذ أي قرار أو إجراء. وأي اعتماد على محتوى ميزان يكون على مسؤولية المستخدم الخاصّة.' },
  { h: '٦. إخلاء المسؤولية', p: 'لا يتحمّل ميزان ولا القائمون عليه أي مسؤولية عن أي ضرر مباشر أو غير مباشر، أو خسارة، أو نتيجة، تنشأ عن استخدام التطبيق أو الاعتماد على محتواه، أو عن أي خطأ في المحتوى المولّد آليّاً، إلى الحدّ الذي يسمح به النظام.' },
  { h: '٧. الخصوصية', p: 'يعالج ميزان الحدّ الأدنى من البيانات اللازمة لتشغيل الحساب، ويلتزم بنظام حماية البيانات الشخصية. للاطّلاع على التفاصيل، راجع سياسة الخصوصية داخل التطبيق.' },
  { h: '٨. الموافقة', p: 'باستخدامك ميزان، تقرّ بأنّك قرأت هذه الشروط وفهمتها ووافقت عليها بالكامل.' },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const writingDir = I18nManager.isRTL ? 'rtl' : 'ltr';
  const [reachedEnd, setReachedEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const onScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 40) {
      setReachedEnd(true);
    }
  };

  async function accept() {
    if (!checked || busy) return;
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (uid) {
        await supabase
          .from('profiles')
          .update({ terms_accepted_at: new Date().toISOString() })
          .eq('id', uid);
      }
    } catch (_) { /* تجاهل، نكمل */ }
    setBusy(false);
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.emerald, colors.emeraldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.head, { paddingTop: insets.top + 18 }]}
      >
        <Text style={[styles.headTitle, { writingDirection: writingDir }]}>شروط الاستخدام</Text>
        <Text style={[styles.headSub, { writingDirection: writingDir }]}>
          يرجى قراءة الشروط كاملةً والموافقة عليها للمتابعة
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator
        onScroll={onScroll}
        scrollEventThrottle={80}
      >
        <Text style={[styles.intro, { writingDirection: writingDir }]}>
          مرحباً بك في ميزان. قبل البدء، يرجى قراءة ما يلي والموافقة عليه.
        </Text>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.h, { writingDirection: writingDir }]}>{s.h}</Text>
            <Text style={[styles.p, { writingDirection: writingDir }]}>{s.p}</Text>
          </View>
        ))}
        <Text style={[styles.endHint, { writingDirection: writingDir }]}>— نهاية الشروط —</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          style={styles.checkRow}
          onPress={() => reachedEnd && setChecked((v) => !v)}
          disabled={!reachedEnd}
        >
          <View style={[styles.box, checked && styles.boxOn, !reachedEnd && styles.boxDim]}>
            {checked ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
          </View>
          <Text style={[styles.checkText, { writingDirection: writingDir }, !reachedEnd && styles.dimText]}>
            {reachedEnd ? 'قرأت الشروط وأوافق عليها' : 'مرّر للأسفل لقراءة الشروط كاملةً'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.btn, (!checked || busy) && styles.btnDim]}
          onPress={accept}
          disabled={!checked || busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>متابعة</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headTitle: { fontFamily: 'Cairo_700Bold', fontSize: 21, color: '#FFFFFF' },
  headSub: { fontFamily: 'Tajawal_500Medium', fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 5, lineHeight: 20 },
  body: { padding: 18, paddingBottom: 30 },
  intro: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: colors.textBody, lineHeight: 25, marginBottom: 16 },
  section: { marginBottom: 16 },
  h: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: colors.emerald, marginBottom: 7 },
  p: { fontFamily: 'Tajawal_400Regular', fontSize: 13.5, color: colors.textBody, lineHeight: 24 },
  endHint: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.emerald },
  boxDim: { borderColor: colors.muted },
  checkText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 13.5, color: colors.textDark },
  dimText: { color: colors.muted },
  btn: {
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDim: { backgroundColor: colors.muted, opacity: 0.5 },
  btnText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#FFFFFF' },
});
