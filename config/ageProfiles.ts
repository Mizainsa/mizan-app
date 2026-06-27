// config/ageProfiles.ts
// التكيّف حسب عمر الطفل — المرحلة الابتدائية حصريًّا (الصفوف ١-٦).
// هوية واحدة Ultra-Premium Playful، تتدرّج نبرتها وألوانها وحجم خطّها
// من «صغير جدًّا مرح» (أول-ثاني) إلى «أنضج قليلًا» (خامس-سادس).
// التطبيق يقرأ صفّ الطفل المحفوظ -> يحمّل البروفايل المناسب.

export type AgeBand = 'early' | 'mid' | 'upper';

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
  difficulty: 'easy' | 'medium' | 'challenging';
}

// تحديد الفئة العمرية من ترتيب الصفّ (1..6).
export function bandFromGradeOrder(order: number): AgeBand {
  if (order <= 2) return 'early'; // الأول والثاني
  if (order <= 4) return 'mid'; // الثالث والرابع
  return 'upper'; // الخامس والسادس
}

export const AGE_PROFILES: Record<AgeBand, AgeProfile> = {
  early: {
    band: 'early',
    label: 'الصفوف الأولى',
    fontScale: 1.18,
    hakeemTone:
      'تحدّث بجُمل قصيرة جدًّا وكلمات بسيطة جدًّا، بحماس ومرح كبير، ' +
      'كأنّك تكلّم طفلًا في السادسة. استخدم التشجيع المستمرّ.',
    greeting: (name) => `هلا ${name} يا بطل! جاهز نلعب ونتعلّم سوا؟`,
    encourage: (name) => `أنت قدّها يا ${name}! حاول وأنا معك!`,
    difficulty: 'easy',
  },
  mid: {
    band: 'mid',
    label: 'الصفوف المتوسّطة',
    fontScale: 1.06,
    hakeemTone:
      'تحدّث بجُمل واضحة ومتوسّطة الطول، بأسلوب ودود ومحفّز، ' +
      'كأنّك تكلّم طفلًا في التاسعة. اشرح المفهوم خطوة بخطوة.',
    greeting: (name) => `أهلاً ${name}! نكمّل تقدّمك الرائع اليوم؟`,
    encourage: (name) => `ركّز يا ${name}، أنت ممتاز في هذا!`,
    difficulty: 'medium',
  },
  upper: {
    band: 'upper',
    label: 'الصفوف العليا',
    fontScale: 0.98,
    hakeemTone:
      'تحدّث بأسلوب أنضج قليلًا وجُمل أطول، بثقة وتحفيز، ' +
      'كأنّك تكلّم طفلًا في الثانية عشرة. قدّم تحدّيًا محترمًا لقدراته.',
    greeting: (name) => `أهلاً ${name}! مستعدّ لتحدّي اليوم؟`,
    encourage: (name) => `فكّر جيّدًا يا ${name}، أنت قادر على حلّها.`,
    difficulty: 'challenging',
  },
};

/**
 * تُرجع البروفايل المناسب لترتيب صفّ الطفل (1..6).
 * عند غياب الترتيب، تعود لبروفايل «الصفوف الأولى» الأكثر أمانًا.
 */
export function getAgeProfile(gradeOrder: number | null | undefined): AgeProfile {
  if (!gradeOrder || gradeOrder < 1) return AGE_PROFILES.early;
  return AGE_PROFILES[bandFromGradeOrder(gradeOrder)];
}
