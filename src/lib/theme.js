// ===== الهوية البصرية لميزان: الفخامة الهادئة (Quiet Luxury) =====
// سمتان: فاتحة (الأصل) وداكنة، تحافظان على هوية السيادة (الكحلي) والثراء (البلاتيني).
export const LIGHT_COLORS = {
  // الخلفيات
  bg: "#FAFAFA",
  bgPure: "#FFFFFF",
  surface: "#FFFFFF",

  // النصوص
  onyx: "#000000",
  textDark: "#111111",
  textBody: "#222222",
  textDim: "#555555",
  textMuted: "#888888",

  // ألوان السيادة (بديل الكحلي)
  royal: "#0F172A",
  royalLight: "#1E293B",
  royalSoft: "#FDF5E6",

  // لمسات الثراء
  platinum: "#D4AF37",

  // الحدود والزجاج
  border: "#E2E8F0",
  borderSoft: "#F1F5F9",
  glass: "rgba(255,255,255,0.9)",
  glassBorder: "rgba(212, 175, 55, 0.3)",

  // الحالات
  white: "#FFFFFF",
  danger: "#991B1B",
  green: "#166534",

  // اسماء التوافق القديمة (يمنع حذفها لحماية النظام)
  navy1: "#0F172A",
  navy2: "#1E293B",
  navyDark: "#000000",
  navyMid: "#111111",
  gold: "#D4AF37",
  goldLight: "#FDE047",
  text: "#111111",
  cardBg: "#FFFFFF",
};

// السمة الداكنة: خلفيات كحلية عميقة، نصوص فاتحة، مع بقاء البلاتيني لمسةَ الثراء.
export const DARK_COLORS = {
  // الخلفيات
  bg: "#0B1120",
  bgPure: "#0F172A",
  surface: "#1A2436",

  // النصوص (مقلوبة لتباين مريح ليلاً)
  onyx: "#F8FAFC",
  textDark: "#F1F5F9",
  textBody: "#E2E8F0",
  textDim: "#A8B3C4",
  textMuted: "#7C8BA1",

  // ألوان السيادة: في الداكن نرفع لمعان السطح المميز قليلاً
  royal: "#1E293B",
  royalLight: "#334155",
  royalSoft: "#1C2740",

  // لمسات الثراء (تبقى ثابتة، هي توقيع الهوية)
  platinum: "#D4AF37",

  // الحدود والزجاج
  border: "#2A3650",
  borderSoft: "#1F2A40",
  glass: "rgba(26,36,54,0.92)",
  glassBorder: "rgba(212, 175, 55, 0.35)",

  // الحالات (نرفع الإضاءة قليلاً للقراءة على خلفية داكنة)
  white: "#FFFFFF",
  danger: "#F87171",
  green: "#4ADE80",

  // اسماء التوافق القديمة
  navy1: "#1E293B",
  navy2: "#334155",
  navyDark: "#0B1120",
  navyMid: "#E2E8F0",
  gold: "#D4AF37",
  goldLight: "#FDE047",
  text: "#F1F5F9",
  cardBg: "#1A2436",
};

// COLORS يبقى اسماً متوافقاً يشير للسمة الفاتحة، حتى لا تتعطل الشاشات التي تستورده مباشرة.
export const COLORS = LIGHT_COLORS;

// ظلال ناعمة موحّدة (Soft Drop Shadow) لتطفو البطاقات
export const SHADOW = {
  card: {
    shadowColor: "#0A2342",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  soft: {
    shadowColor: "#0A2342",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: "#0A2342",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const RADIUS = { sm: 14, md: 20, lg: 26, xl: 32 };

export const TAGLINE = "استشر · اعرف · تصرّف";
export const APP_NAME = "ميزان";
export const APP_SUB = "دليلك القانوني السعودي";

// الأقسام (نفس أقسام الويب)
export const SECTIONS = [
  { id: "guidance",  title: "المرشد القانوني", sub: "اسأل واحصل على إجابة فورية", icon: "comments" },
  { id: "analyzer",  title: "محلل البنود",      sub: "لوائح وخطابات وتحليل",      icon: "search" },
  { id: "consultant",title: "الاستشارات",        sub: "نموذج استرشادي محاكي",       icon: "headset" },
  { id: "sayigh",    title: "الصائغ",            sub: "ملحقات ولوائح للمنشآت",     icon: "file-signature" },
  { id: "wakeel",    title: "اسأل وكيلك",        sub: "مساعد طوارئ قانوني سريع",   icon: "bolt" },
  { id: "calculators", title: "الحاسبات القانونية", sub: "مكافأة ونفقة وميراث ورسوم", icon: "calculator" },
  { id: "specialized", title: "الأقسام المتخصصة", sub: "خبير لكل مجال قانوني", icon: "th-list" },
  { id: "documents", title: "مولّدات المستندات", sub: "لوائح ومذكرات وعقود وتظلمات", icon: "file-alt" },
  { id: "knowledge", title: "المعرفة القانونية", sub: "مصطلحات وأسئلة شائعة", icon: "book" },
  { id: "reminders", title: "التذكيرات والمهل", sub: "تذكير التجديد والجلسات", icon: "bell" },
  { id: "templates", title: "القوالب الجاهزة", sub: "إنذار وإقرار وتفويض وسند", icon: "file-invoice" },
  { id: "compare", title: "مقارنة المستندات", sub: "افرق بين نسختين", icon: "exchange-alt" },
  { id: "signature", title: "التوقيع الإلكتروني", sub: "وقّع مستندك ثم صدّره", icon: "signature" },
  { id: "platforms", title: "دليل المنصات",      sub: "ناجز، قوى، إيجار، أبشر",    icon: "th-large" },
];

// المنصات (نفس منصات الويب)
export const PLATFORMS = [
  { id: "najz",   name: "ناجز",   name_en: "Najiz",  url: "https://najiz.sa" },
  { id: "qiwa",   name: "قوى",    name_en: "Qiwa",   url: "https://qiwa.sa" },
  { id: "ejar",   name: "إيجار",  name_en: "Ejar",   url: "https://www.ejar.sa" },
  { id: "absher", name: "أبشر",   name_en: "Absher", url: "https://www.absher.sa" },
  { id: "gosi",   name: "التأمينات", name_en: "GOSI", url: "https://www.gosi.gov.sa" },
  { id: "etimad", name: "اعتماد", name_en: "Etimad", url: "https://etimad.sa" },
  { id: "balady", name: "بلدي",   name_en: "Balady", url: "https://balady.gov.sa" },
];

// أمثلة سريعة لكل قسم (أزرار تسهّل البدء)
export const SPECIALIZED_SECTIONS = [
  { id: "sec_women",       title: "حقوق المرأة",          sub: "حضانة ونفقة وطلاق وميراث",      title_en: "Women's Rights",        sub_en: "Custody, alimony, divorce, inheritance", icon: "venus" },
  { id: "sec_domestic",    title: "العمالة المنزلية",     sub: "عقود وأجور ونقل خدمات",         title_en: "Domestic Labor",        sub_en: "Contracts, wages, service transfer", icon: "hands-helping" },
  { id: "sec_startup",     title: "الشركات الناشئة",      sub: "تأسيس وحصص واستثمار",          title_en: "Startups",              sub_en: "Incorporation, shares, investment", icon: "rocket" },
  { id: "sec_realestate",  title: "العقارات والتطوير",    sub: "بيع وإيجار وإفراغ وتطوير",      title_en: "Real Estate & Development", sub_en: "Sale, lease, title transfer, development", icon: "building" },
  { id: "sec_ecommerce",   title: "التجارة الإلكترونية",  sub: "متاجر وبيانات واسترجاع",        title_en: "E-Commerce",            sub_en: "Stores, data, returns", icon: "shopping-cart" },
  { id: "sec_ip",          title: "الملكية الفكرية",      sub: "علامات وبراءات وحقوق مؤلف",     title_en: "Intellectual Property", sub_en: "Trademarks, patents, copyright", icon: "lightbulb" },
  { id: "sec_labor",       title: "القضايا العمالية",     sub: "فصل ومستحقات وإصابات عمل",      title_en: "Labor Disputes",        sub_en: "Dismissal, dues, work injuries", icon: "user-tie" },
  { id: "sec_personal",    title: "الأحوال الشخصية",      sub: "زواج وطلاق وحضانة ووصية",       title_en: "Personal Status",       sub_en: "Marriage, divorce, custody, wills", icon: "users" },
  { id: "sec_traffic",     title: "المرور والتأمين",      sub: "حوادث ومخالفات وتعويضات",       title_en: "Traffic & Insurance",   sub_en: "Accidents, violations, compensation", icon: "car-crash" },
  { id: "sec_consumer",    title: "حماية المستهلك",       sub: "ضمانات وعيوب وشكاوى",           title_en: "Consumer Protection",   sub_en: "Warranties, defects, complaints", icon: "shield-alt" },
  { id: "sec_contracting", title: "المقاولات",            sub: "مستخلصات وضمانات وتأخير",       title_en: "Contracting",           sub_en: "Payment claims, guarantees, delays", icon: "hard-hat" },
];

export const DOCUMENT_GENERATORS = [
  { id: "gen_objection",        title: "لائحة اعتراضية على حكم", sub: "اعتراض مهيكل على حكم قضائي", title_en: "Appeal Against a Judgment", sub_en: "Structured appeal of a court ruling", icon: "balance-scale-left" },
  { id: "gen_reply",            title: "مذكرة جوابية",          sub: "رد على دعوى مرفوعة عليك",   title_en: "Statement of Defense",  sub_en: "Reply to a lawsuit filed against you", icon: "reply" },
  { id: "gen_opponent",         title: "رد الخصم المتوقع",      sub: "استعد لما سيدفع به الطرف الآخر", title_en: "Anticipated Rebuttal", sub_en: "Prepare for the other party's arguments", icon: "chess" },
  { id: "gen_settlement",       title: "محضر صلح",              sub: "اتفاق متوازن بين طرفين",    title_en: "Settlement Record",     sub_en: "A balanced agreement between two parties", icon: "handshake" },
  { id: "gen_warning_reply",    title: "رد على إنذار",          sub: "رد رسمي على إنذار وصلك",    title_en: "Reply to a Notice",     sub_en: "Formal reply to a notice you received", icon: "exclamation" },
  { id: "gen_obligations",      title: "جدول التزامات الأطراف", sub: "استخلاص التزامات من عقد",   title_en: "Parties' Obligations Table", sub_en: "Extract obligations from a contract", icon: "tasks" },
  { id: "gen_grievance",        title: "خطاب تظلم",             sub: "تظلم على رفض معاملة",       title_en: "Grievance Letter",      sub_en: "Grievance against a rejected transaction", icon: "file-signature" },
  { id: "gen_special_contract", title: "عقود متخصصة",           sub: "امتياز وتوريد وخدمات ووكالة", title_en: "Specialized Contracts", sub_en: "Franchise, supply, services, agency", icon: "file-contract" },
];

export const QUICK_EXAMPLES = {
  guidance: [
    "كيف أعترض على مخالفة ساهر المرورية؟",
    "ما حقي في نفقة وحضانة الأطفال؟",
    "هل فصلي من العمل يُعد فصلاً تعسفياً؟",
    "كيف أحسب مكافأة نهاية الخدمة؟",
  ],
  analyzer: [
    "حلّل بنود عقد العمل المرفق",
    "ما المخاطر في هذا البند؟",
    "هل في هذا العقد بنود مجحفة أو إذعان؟",
    "ما البنود التي قد تضر بي في هذا العقد؟",
  ],
  consultant: [
    "أريد استشارة في نزاع عمالي",
    "ما خطواتي في قضية مطالبة مالية؟",
  ],
  sayigh: [
    "صُغ لي لائحة دعوى مطالبة مالية",
    "أحتاج صيغة عقد عمل",
  ],
  wakeel: [
    "نزاع مع صاحب العمل وأريد توقيف راتبي",
    "تعرضت لحادث مروري الآن",
    "يهددني شخص بنشر بياناتي",
    "رفضوا تسليمي حقي بعد انتهاء العقد",
  ],
};
