// محاور ميزان السبعة ومساعدوها — مطابقة لقاعدة البيانات (جدول assistants)
// كل خبير: { id, name (عربي), name_en (إنجليزي) }
// المعرّفات (id) ثابتة لا تتغيّر حفاظاً على ربط الدساتير في الخادم.
export const axes = [
  {
    id: 'family',
    title: 'الأسرة والأحوال',
    title_en: 'Family & Status',
    icon: 'people-outline',
    experts: [
      { id: 'family_civil_affairs', name: 'ميزان الهوية', name_en: 'Mizan Identity' },
      { id: 'family_marriage', name: 'ميزان الزواج', name_en: 'Mizan Marriage' },
      { id: 'family_divorce', name: 'ميزان الطلاق', name_en: 'Mizan Divorce' },
      { id: 'family_custody', name: 'ميزان الحضانة', name_en: 'Mizan Custody' },
      { id: 'family_alimony', name: 'ميزان النفقة', name_en: 'Mizan Alimony' },
      { id: 'family_reconciliation', name: 'ميزان الصلح الأسري', name_en: 'Mizan Family Reconciliation' },
      { id: 'family_protection', name: 'ميزان الحماية الأسرية', name_en: 'Mizan Family Protection' },
    ],
  },
  {
    id: 'labor',
    title: 'العمل والأفراد',
    title_en: 'Work & Labor',
    icon: 'briefcase-outline',
    experts: [
      { id: 'qiwa_contracts', name: 'ميزان عقود العمل', name_en: 'Mizan Work Contracts' },
      { id: 'mudad', name: 'ميزان الأجور', name_en: 'Mizan Wages' },
      { id: 'labor_complaints', name: 'ميزان الشكاوى العمالية', name_en: 'Mizan Labor Complaints' },
      { id: 'musaned', name: 'ميزان العمالة المنزلية', name_en: 'Mizan Domestic Labor' },
      { id: 'social_insurance', name: 'ميزان التأمينات', name_en: 'Mizan Social Insurance' },
      { id: 'passports_residency', name: 'ميزان الوافدين', name_en: 'Mizan Residency' },
    ],
  },
  {
    id: 'finance',
    title: 'المال والتعاملات',
    title_en: 'Money & Transactions',
    icon: 'cash-outline',
    experts: [
      { id: 'banks_sama', name: 'ميزان المصرفي', name_en: 'Mizan Banking' },
      { id: 'support_daman', name: 'ميزان الدعم', name_en: 'Mizan Support' },
      { id: 'claims', name: 'ميزان المطالبات', name_en: 'Mizan Claims' },
      { id: 'enforcement', name: 'ميزان التنفيذ', name_en: 'Mizan Enforcement' },
      { id: 'cheques_commercial_papers', name: 'ميزان الأوراق التجارية', name_en: 'Mizan Commercial Papers' },
      { id: 'default_bankruptcy', name: 'ميزان التعثّر', name_en: 'Mizan Default & Bankruptcy' },
    ],
  },
  {
    id: 'judicial',
    title: 'المساعد العدلي',
    title_en: 'Judicial Assistant',
    icon: 'business-outline',
    experts: [
      { id: 'judicial_litigation', name: 'ميزان التقاضي', name_en: 'Mizan Litigation' },
      { id: 'judicial_documentation', name: 'ميزان التوثيق', name_en: 'Mizan Documentation' },
      { id: 'judicial_reconciliation', name: 'ميزان الصلح القضائي', name_en: 'Mizan Judicial Reconciliation' },
      { id: 'judicial_objections', name: 'ميزان المهل والاعتراض', name_en: 'Mizan Appeals & Deadlines' },
    ],
  },
  {
    id: 'cyber',
    title: 'مخالفات رقمية',
    title_en: 'Digital Crimes',
    icon: 'shield-outline',
    experts: [
      { id: 'financial_fraud', name: 'ميزان الاحتيال الرقمي', name_en: 'Mizan Digital Fraud' },
      { id: 'electronic_extortion', name: 'ميزان الابتزاز', name_en: 'Mizan Extortion' },
      { id: 'identity_hacking', name: 'ميزان الاختراق', name_en: 'Mizan Hacking' },
      { id: 'post_report', name: 'ميزان ما بعد البلاغ', name_en: 'Mizan After Reporting' },
    ],
  },
  {
    id: 'emergency',
    title: 'الطوارئ والحوادث',
    title_en: 'Emergencies & Accidents',
    icon: 'alert-circle-outline',
    experts: [
      { id: 'traffic_accidents', name: 'ميزان الحوادث', name_en: 'Mizan Accidents' },
      { id: 'traffic_violations', name: 'ميزان المخالفات المرورية', name_en: 'Mizan Traffic Violations' },
      { id: 'emergency_firstaid', name: 'ميزان الطوارئ', name_en: 'Mizan Emergency' },
      { id: 'vehicle_insurance', name: 'ميزان تأمين المركبات', name_en: 'Mizan Vehicle Insurance' },
    ],
  },
  {
    id: 'development',
    title: 'تطويرك',
    title_en: 'Your Growth',
    icon: 'trending-up-outline',
    experts: [
      { id: 'career_path', name: 'ميزان المسار المهني', name_en: 'Mizan Career Path' },
      { id: 'professional_certs', name: 'ميزان الشهادات', name_en: 'Mizan Certifications' },
      { id: 'entrepreneurship', name: 'ميزان ريادة الأعمال', name_en: 'Mizan Entrepreneurship' },
    ],
  },
];
