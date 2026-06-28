// config/ageProfiles.ts
// التكيّف حسب عمر الطفل — المرحلة الابتدائية الأولى حصريًّا (الصفوف ١-٣).
// هوية واحدة Ultra-Premium Playful، تتدرّج نبرتها وألوانها وحجم خطّها
// من «صغير جدًّا مرح» (الأول-الثاني) إلى «أنضج قليلًا» (الثالث).
// التطبيق يقرأ صفّ الطفل المحفوظ -> يحمّل البروفايل المناسب.

export type AgeBand = 'early' | 'mid';

export interface AgeProfile {
  band: AgeBand;
  label: string;
  // معامل حجم الخطّ (الأصغر سنًّا = خطّ أكبر)
  fontScale: number;
  // نبرة حكيم (تُرسل للذكاء + تظهر في الواجهة)
  hakeemTone: string;
  // أمثلة عبارات حكيم حسب العمر
  greeting: (name: string) => string;
  encourage: (name: string) => string;
  // صعوبة اللعب/التمارين
  difficulty: 'easy' | 'medium';
}

// تحديد الفئة العمرية من ترتيب الصفّ (1..3).
export function bandFromGradeOrder(order: number): AgeBand {
  if (order <= 2) return 'early'; // الأول والثاني
  return 'mid'; // الثالث
}

export const AGE_PROFILES: Record<AgeBand, AgeProfile> = {
  early: {
    band: 'early',
    label: 'الصفوف الأولى',
    fontScale: 1.18,
    hakeemTone:
      'تحدّث بجُمل قصيرة جدًّا وكلمات بسيطة جدًّا، بحماس ومرح كبير، ' +
      'كأنّك تكلّم طفلًا في السادسة أو السابعة. استخدم التشجيع المستمرّ.',
    greeting: (name) => `هلا ${name} يا بطل! جاهز نلعب ونتعلّم سوا؟`,
    encourage: (name) => `أنت قدّها يا ${name}! حاول وأنا معك!`,
    difficulty: 'easy',
  },
  mid: {
    band: 'mid',
    label: 'الصفّ الثالث',
    fontScale: 1.06,
    hakeemTone:
      'تحدّث بجُمل واضحة ومتوسّطة الطول، بأسلوب ودود ومحفّز، ' +
      'كأنّك تكلّم طفلًا في الثامنة أو التاسعة. اشرح المفهوم خطوة بخطوة.',
    greeting: (name) => `أهلاً ${name}! نكمّل تقدّمك الرائع اليوم؟`,
    encourage: (name) => `ركّز يا ${name}، أنت ممتاز في هذا!`,
    difficulty: 'medium',
  },
};

/**
 * تُرجع البروفايل المناسب لترتيب صفّ الطفل (1..3).
 * عند غياب الترتيب، تعود لبروفايل «الصفوف الأولى» الأكثر أمانًا.
 */
export function getAgeProfile(gradeOrder: number | null | undefined): AgeProfile {
  if (!gradeOrder || gradeOrder < 1) return AGE_PROFILES.early;
  return AGE_PROFILES[bandFromGradeOrder(gradeOrder)];
}
