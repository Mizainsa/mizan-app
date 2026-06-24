import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const DISCLAIMER =
  'هذا شرح تعريفي عامّ لكيفية الاحتساب، وليس نتيجة رسمية. تختلف التفاصيل حسب حالتك ونصوص النظام المعمول به، ويُنصح بالرجوع إلى الجهة الرسمية للتأكّد.';

// محتوى تعليمي ثابت (معادلات عامّة لا تتغيّر إلا بتعديل النظام).
const CALCULATORS = [
  {
    id: 'eos',
    title: 'مكافأة نهاية الخدمة',
    icon: 'briefcase-outline',
    intro: 'مبلغ يستحقّه العامل عند انتهاء علاقة العمل، يُحتسب على أساس الأجر ومدّة الخدمة وفق نظام العمل.',
    sections: [
      {
        h: 'القاعدة العامّة',
        lines: [
          'أجر نصف شهر عن كل سنة من سنوات الخدمة الخمس الأولى.',
          'أجر شهر كامل عن كل سنة من السنوات التالية.',
          'تُحسب مدّة الكسور من السنة بنسبتها.',
        ],
      },
      {
        h: 'اعتبارات تؤثّر في المبلغ',
        lines: [
          'سبب انتهاء العلاقة (انتهاء عقد، استقالة، فصل) قد يغيّر الاستحقاق أو نسبته.',
          'الأجر المعتمد في الاحتساب يشمل عادةً الأجر الأساسي والبدلات الثابتة.',
          'قد توجد حالات خاصّة (الاستقالة قبل مدد معيّنة) تُعدّل الاستحقاق.',
        ],
      },
    ],
  },
  {
    id: 'gosi',
    title: 'معاش التأمينات (GOSI)',
    icon: 'shield-checkmark-outline',
    intro: 'المعاش التقاعدي يُحتسب على أساس متوسّط الأجر الخاضع للاشتراك ومدّة الاشتراك وفق نظام التأمينات الاجتماعية.',
    sections: [
      {
        h: 'الأساس العامّ للاحتساب',
        lines: [
          'يُعتمد متوسّط الأجر الشهري الخاضع للاشتراك خلال فترة يحدّدها النظام.',
          'يرتبط مقدار المعاش بعدد سنوات الاشتراك الفعلية.',
          'لكل سنة اشتراك نسبة من متوسّط الأجر تتجمّع لتكوّن المعاش.',
        ],
      },
      {
        h: 'اعتبارات مؤثّرة',
        lines: [
          'بلوغ السنّ النظامية أو استكمال مدّة الاشتراك المطلوبة شرط للاستحقاق.',
          'قد تختلف القواعد بين المعاش المبكّر والمعاش عند السنّ النظامية.',
          'تُضاف أحياناً مدد اعتبارية أو تُضمّ مدد سابقة وفق ضوابط.',
        ],
      },
    ],
  },
  {
    id: 'alimony',
    title: 'النفقة — مبادئ التقدير',
    icon: 'people-outline',
    intro: 'النفقة تقدير اجتهادي يراعي حاجة المستحقّ ويسر المُنفِق، ولا توجد لها معادلة رقمية ثابتة.',
    sections: [
      {
        h: 'عناصر يُراعيها التقدير',
        lines: [
          'حاجة المستحقّ الفعلية (سكن، غذاء، تعليم، علاج).',
          'دخل المُنفِق وقدرته المالية ويُسره أو عُسره.',
          'مستوى المعيشة المعتاد، وعدد المستحقّين للنفقة.',
        ],
      },
      {
        h: 'ملاحظات مهمّة',
        lines: [
          'التقدير قد يتغيّر بتغيّر الظروف (زيادة الدخل أو الحاجة).',
          'يمكن مراجعة قيمة النفقة لاحقاً عند تغيّر الحال.',
          'لا يوجد رقم ثابت؛ يقدّرها المختصّ حسب كل حالة.',
        ],
      },
    ],
  },
];

export default function EstimatorScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const writingDir = I18nManager.isRTL ? 'rtl' : 'ltr';
  const [openId, setOpenId] = useState(null);

  const active = CALCULATORS.find((c) => c.id === openId) ?? null;

  // عرض موضوع مفتوح
  if (active) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[colors.emerald, colors.emeraldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.head, { paddingTop: insets.top + 12 }]}
        >
          <Pressable style={styles.back} onPress={() => setOpenId(null)}>
            <Ionicons name="arrow-forward" size={22} color={colors.goldLight} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headTitle, { writingDirection: writingDir }]}>{active.title}</Text>
            <Text style={[styles.headSub, { writingDirection: writingDir }]}>شرح تعريفي</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <Text style={[styles.introText, { writingDirection: writingDir }]}>{active.intro}</Text>
          </View>

          {active.sections.map((sec, i) => (
            <View key={i} style={styles.secCard}>
              <View style={styles.secHeadRow}>
                <View style={styles.secBar} />
                <Text style={[styles.secHead, { writingDirection: writingDir }]}>{sec.h}</Text>
              </View>
              {sec.lines.map((ln, j) => (
                <View key={j} style={styles.lineRow}>
                  <Ionicons name="ellipse" size={6} color={colors.gold} style={{ marginTop: 8 }} />
                  <Text style={[styles.lineText, { writingDirection: writingDir }]}>{ln}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.discBar}>
            <Ionicons name="information-circle-outline" size={18} color={colors.gold} />
            <Text style={[styles.discText, { writingDirection: writingDir }]}>{DISCLAIMER}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // قائمة المواضيع
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.emerald, colors.emeraldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.head, { paddingTop: insets.top + 16 }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.headTitle, { writingDirection: writingDir }]}>المساعد التقديري</Text>
          <Text style={[styles.headSub, { writingDirection: writingDir }]}>
            شروحات تعريفية لكيفية الاحتساب
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {CALCULATORS.map((c) => (
          <Pressable key={c.id} style={styles.calcCard} onPress={() => setOpenId(c.id)}>
            <View style={styles.calcIcon}>
              <Ionicons name={c.icon} size={22} color={colors.goldLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.calcTitle, { writingDirection: writingDir }]}>{c.title}</Text>
              <Text style={[styles.calcIntro, { writingDirection: writingDir }]} numberOfLines={2}>
                {c.intro}
              </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={colors.muted} />
          </Pressable>
        ))}

        <Text style={[styles.footnote, { writingDirection: writingDir }]}>{DISCLAIMER}</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(227,199,102,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { fontFamily: 'Cairo_700Bold', fontSize: 21, color: '#FFFFFF' },
  headSub: { fontFamily: 'Tajawal_500Medium', fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  body: { padding: 18, paddingBottom: 40 },
  calcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    boxShadow: '0px 4px 12px 0px rgba(10,42,27,0.05)',
  },
  calcIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcTitle: { fontFamily: 'Cairo_700Bold', fontSize: 15.5, color: colors.textDark },
  calcIntro: { fontFamily: 'Tajawal_400Regular', fontSize: 12.5, color: colors.muted, marginTop: 4, lineHeight: 19 },
  introCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  introText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: colors.textBody, lineHeight: 24 },
  secCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  secHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  secBar: { width: 22, height: 3, borderRadius: 2, backgroundColor: colors.gold },
  secHead: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: colors.emerald },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  lineText: { flex: 1, fontFamily: 'Tajawal_400Regular', fontSize: 13.5, color: colors.textBody, lineHeight: 23 },
  discBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: 'rgba(201,162,39,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,162,39,0.25)',
    borderRadius: 12,
    padding: 13,
    marginTop: 4,
  },
  discText: { flex: 1, fontFamily: 'Tajawal_400Regular', fontSize: 11.5, color: colors.textBody, lineHeight: 19 },
  footnote: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 11.5,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
});
