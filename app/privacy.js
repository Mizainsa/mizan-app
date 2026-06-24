import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';

const SECTIONS = [
  {
    h: '١. مبدأنا: الحدّ الأدنى من البيانات',
    p: 'ميزان مساعد استرشادي للتوعية. نعتمد مبدأ «الخصوصية بالتصميم»، فنجمع فقط ما هو ضروري لتشغيل الحساب وتقديم الإرشاد، ولا نطلب منك بيانات شخصية حسّاسة.',
  },
  {
    h: '٢. البيانات التي نعالجها ونخزّنها',
    p: 'لتشغيل حسابك، نخزّن الحدّ الأدنى: بريدك الإلكتروني وبيانات تسجيل الدخول، باقتك الحالية وعدّاد محادثاتك، وإشعاراتك داخل التطبيق. ويُعالَج نصّ سؤالك عبر نماذج الذكاء الاصطناعي لتقديم الإرشاد. ولا نطلب أرقام الهوية أو البيانات المالية أو صور المستندات.',
  },
  {
    h: '٣. تجريد البيانات قبل البحث',
    p: 'عندما يتطلّب سؤالك معلومة محدّثة، يُجرى بحث في المصادر الرسمية السعودية فقط. وقبل إرسال أي استعلام، نُجرّد النصّ آليّاً من الأنماط الحسّاسة (أرقام الهوية، الحسابات، الآيبان، البريد، الهواتف) حتى لا ترتبط بهويتك.',
  },
  {
    h: '٤. أطراف ثالثة (الذكاء الاصطناعي والبحث)',
    p: 'تُعالَج استفساراتك عبر نماذج ذكاء اصطناعي (OpenAI). وعند الحاجة لمعلومة محدّثة نستخدم أداة بحث محصورة في النطاقات الحكومية السعودية الرسمية. ونحرص على عدم استخدام مدخلاتك لأغراض التدريب أو الإعلانات.',
  },
  {
    h: '٥. حقوقك',
    p: 'الوصول: معرفة البيانات التي نعالجها عنك. الحذف: يمكنك حذف حسابك وكل بياناتك نهائيّاً من «حسابي ← حذف الحساب»، ويتمّ الحذف فعليّاً من خوادمنا بلا رجعة. التصحيح: راسلنا عبر بريد الدعم.',
  },
  {
    h: '٦. أمن المعلومات',
    p: 'تشفير نقل البيانات بين تطبيقك وخوادمنا، وقيود أمنية صارمة تمنع التطبيق من قبول أو معالجة بيانات مالية أو حسّاسة حتى لو حاول المستخدم إدخالها. والبيانات الحسّاسة في حسابك تُدار من الخادم فقط.',
  },
  {
    h: '٧. روابط حكومية خارجية',
    p: 'قد يوجّهك ميزان إلى بوّابات حكومية رسمية (أبشر، ناجز، قوى وغيرها). لسنا مسؤولين عن سياسات خصوصية تلك المواقع، وننصحك بمراجعة سياسة كل بوّابة تزورها.',
  },
  {
    h: '٨. التغييرات على هذه السياسة',
    p: 'قد نحدّث هذه السياسة من وقت لآخر، ونشعرك بأي تحديث جوهري عبر التطبيق.',
  },
  {
    h: '٩. التواصل',
    p: 'لأي استفسار حول خصوصيتك أو أمن بياناتك، تواصل معنا عبر بريد الدعم المخصّص.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const writingDir = I18nManager.isRTL ? 'rtl' : 'ltr';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.emerald, colors.emeraldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.head, { paddingTop: insets.top + 12 }]}
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={colors.goldLight} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headTitle, { writingDirection: writingDir }]}>سياسة الخصوصية</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { writingDirection: writingDir }]}>
          نلتزم بحماية بياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية السعودي. توضّح هذه السياسة البيانات التي نعالجها وكيف نحميها.
        </Text>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.h, { writingDirection: writingDir }]}>{s.h}</Text>
            <Text style={[styles.p, { writingDirection: writingDir }]}>{s.p}</Text>
          </View>
        ))}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(227,199,102,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { fontFamily: 'Cairo_700Bold', fontSize: 19, color: '#FFFFFF' },
  body: { padding: 18, paddingBottom: 40 },
  intro: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
    color: colors.textBody,
    lineHeight: 25,
    marginBottom: 18,
  },
  section: { marginBottom: 18 },
  h: { fontFamily: 'Cairo_700Bold', fontSize: 15.5, color: colors.emerald, marginBottom: 8 },
  p: { fontFamily: 'Tajawal_400Regular', fontSize: 13.5, color: colors.textBody, lineHeight: 25 },
});
