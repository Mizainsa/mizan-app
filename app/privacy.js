import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { useLang } from '../theme/LanguageContext';

const UI = {
  title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  intro: {
    ar: 'نلتزم بحماية بياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية السعودي. توضّح هذه السياسة البيانات التي نعالجها وكيف نحميها.',
    en: 'We are committed to protecting your personal data in accordance with the Saudi Personal Data Protection Law. This policy explains what data we process and how we protect it.',
  },
};

const SECTIONS = [
  {
    h: { ar: '١. مبدأنا: الحدّ الأدنى من البيانات', en: '1. Our principle: data minimization' },
    p: {
      ar: 'ميزان مساعد استرشادي للتوعية. نعتمد مبدأ «الخصوصية بالتصميم», فنجمع فقط ما هو ضروري لتشغيل الحساب وتقديم الإرشاد، ولا نطلب منك بيانات شخصية حسّاسة.',
      en: 'Mizan is an awareness guidance assistant. We follow a "privacy by design" approach, collecting only what is necessary to run your account and provide guidance, and we do not request sensitive personal data.',
    },
  },
  {
    h: { ar: '٢. البيانات التي نعالجها ونخزّنها', en: '2. Data we process and store' },
    p: {
      ar: 'لتشغيل حسابك، نخزّن الحدّ الأدنى: بريدك الإلكتروني وبيانات تسجيل الدخول، باقتك الحالية وعدّاد محادثاتك، وإشعاراتك داخل التطبيق. ويُعالَج نصّ سؤالك عبر نماذج الذكاء الاصطناعي لتقديم الإرشاد. ولا نطلب أرقام الهوية أو البيانات المالية أو صور المستندات.',
      en: 'To run your account, we store the minimum: your email and login data, your current plan and conversation counter, and your in-app notifications. The text of your question is processed by AI models to provide guidance. We do not request ID numbers, financial data, or document images.',
    },
  },
  {
    h: { ar: '٣. تجريد البيانات قبل البحث', en: '3. Stripping data before search' },
    p: {
      ar: 'عندما يتطلّب سؤالك معلومة محدّثة، يُجرى بحث في المصادر الرسمية السعودية فقط. وقبل إرسال أي استعلام، نُجرّد النصّ آليّاً من الأنماط الحسّاسة (أرقام الهوية, الحسابات, الآيبان, البريد, الهواتف) حتى لا ترتبط بهويتك.',
      en: 'When your question requires up-to-date information, a search is performed within official Saudi sources only. Before sending any query, we automatically strip the text of sensitive patterns (ID numbers, account numbers, IBANs, emails, phone numbers) so it cannot be linked to your identity.',
    },
  },
  {
    h: { ar: '٤. أطراف ثالثة (الذكاء الاصطناعي والبحث)', en: '4. Third parties (AI and search)' },
    p: {
      ar: 'تُعالَج استفساراتك عبر نماذج ذكاء اصطناعي (OpenAI). وعند الحاجة لمعلومة محدّثة نستخدم أداة بحث محصورة في النطاقات الحكومية السعودية الرسمية. ونحرص على عدم استخدام مدخلاتك لأغراض التدريب أو الإعلانات.',
      en: 'Your inquiries are processed through AI models (OpenAI). When up-to-date information is needed, we use a search tool restricted to official Saudi government domains. We ensure your inputs are not used for training or advertising purposes.',
    },
  },
  {
    h: { ar: '٥. حقوقك', en: '5. Your rights' },
    p: {
      ar: 'الوصول: معرفة البيانات التي نعالجها عنك. الحذف: يمكنك حذف حسابك وكل بياناتك نهائيّاً من «حسابي ← حذف الحساب», ويتمّ الحذف فعليّاً من خوادمنا بلا رجعة. التصحيح: راسلنا عبر بريد الدعم.',
      en: 'Access: to know what data we process about you. Deletion: you can permanently delete your account and all your data from "Account → Delete Account", and the deletion is performed from our servers irreversibly. Correction: contact us via the support email.',
    },
  },
  {
    h: { ar: '٦. أمن المعلومات', en: '6. Information security' },
    p: {
      ar: 'تشفير نقل البيانات بين تطبيقك وخوادمنا, وقيود أمنية صارمة تمنع التطبيق من قبول أو معالجة بيانات مالية أو حسّاسة حتى لو حاول المستخدم إدخالها. والبيانات الحسّاسة في حسابك تُدار من الخادم فقط.',
      en: 'Data transfer between your app and our servers is encrypted, with strict security restrictions that prevent the app from accepting or processing financial or sensitive data even if a user tries to enter it. Sensitive account data is managed only on the server.',
    },
  },
  {
    h: { ar: '٧. روابط ومصادر خارجية', en: '7. External links and sources' },
    p: {
      ar: 'عند الحاجة، قد يرشدك ميزان إلى مصادر خارجية لإكمال ما تبحث عنه. هذه المصادر مستقلّة عنّا، ولها سياسات خصوصية خاصّة ننصحك بالاطّلاع عليها.',
      en: 'When needed, Mizan may guide you to external sources to complete what you are looking for. These sources are independent of us and have their own privacy policies that we advise you to review.',
    },
  },
  {
    h: { ar: '٨. التغييرات على هذه السياسة', en: '8. Changes to this policy' },
    p: {
      ar: 'قد نحدّث هذه السياسة من وقت لآخر، ونشعرك بأي تحديث جوهري عبر التطبيق.',
      en: 'We may update this policy from time to time, and we will notify you of any material update through the app.',
    },
  },
  {
    h: { ar: '٩. التواصل', en: '9. Contact' },
    p: {
      ar: 'لأي استفسار حول خصوصيتك أو أمن بياناتك، تواصل معنا عبر بريد الدعم المخصّص.',
      en: 'For any inquiry about your privacy or data security, contact us via the dedicated support email.',
    },
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { lang } = useLang();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const writingDir = I18nManager.isRTL ? 'rtl' : 'ltr';
  const L = (obj) => (obj && obj[lang]) || (obj && obj.ar) || '';

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
          <Text style={[styles.headTitle, { writingDirection: writingDir }]}>{L(UI.title)}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { writingDirection: writingDir }]}>
          {L(UI.intro)}
        </Text>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.h, { writingDirection: writingDir }]}>{L(s.h)}</Text>
            <Text style={[styles.p, { writingDirection: writingDir }]}>{L(s.p)}</Text>
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
