// ===== فهرس البحث الذكي ثنائي اللغة =====
// مساعد بحث عام للموقع: يغطي كل الأقسام والخدمات والمنصات والمولّدات والحاسبات
// والمصطلحات، مع كلمات مفتاحية مرادفة بالعربية والإنجليزية لكل وجهة.
// يعمل محلياً وفورياً بلا خادم. كل عنصر يحمل: المفتاح، نوع الوجهة، وكلمات بحثية.

// أنواع الوجهات: "section" (بطاقة رئيسية), "screen" (شاشة مستقلة),
// "platform" (خبير منصة), "doc" (مولّد مستند), "specialized" (قسم متخصص),
// "calculator" (حاسبة), "term" (مصطلح).

export const SEARCH_INDEX = [
  // ===== البطاقات الرئيسية =====
  { id: "guidance", type: "section", route: "Section", titleAr: "المرشد القانوني", titleEn: "Legal Guide",
    kw: ["مرشد","استشارة","سؤال","استفسار","نصيحة","guide","ask","question","advice","legal","consult"] },
  { id: "analyzer", type: "section", route: "Section", titleAr: "محلل البنود", titleEn: "Clause Analyzer",
    kw: ["تحليل","بنود","عقد","مراجعة","خطاب","analyze","clause","contract","review","analysis"] },
  { id: "consultant", type: "section", route: "Section", titleAr: "الاستشارات", titleEn: "Consultations",
    kw: ["استشارة","تكييف","خريطة طريق","consult","advisory","roadmap"] },
  { id: "sayigh", type: "section", route: "Section", titleAr: "الصائغ", titleEn: "The Drafter",
    kw: ["صياغة","ملحق","لائحة","منشأة","draft","drafting","annex","memo"] },
  { id: "wakeel", type: "section", route: "Section", titleAr: "اسأل وكيلك", titleEn: "Ask Your Agent",
    kw: ["وكيل","طوارئ","عاجل","مهلة","agent","emergency","urgent","deadline"] },

  // ===== الشاشات المستقلة =====
  { id: "calculators", type: "screen", route: "Calculators", titleAr: "الحاسبات القانونية", titleEn: "Legal Calculators",
    kw: ["حاسبة","حساب","مكافأة","نهاية الخدمة","نفقة","ميراث","رسوم","calculator","calculate","award","alimony","inheritance","fees","end of service"] },
  { id: "specialized", type: "screen", route: "Specialized", titleAr: "الأقسام المتخصصة", titleEn: "Specialized Sections",
    kw: ["متخصص","قسم","مجال","خبير","specialized","section","field","expert"] },
  { id: "documents", type: "screen", route: "Documents", titleAr: "مولّدات المستندات", titleEn: "Document Generators",
    kw: ["مستند","توليد","صياغة","وثيقة","لائحة","مذكرة","document","generate","draft","memo","letter"] },
  { id: "knowledge", type: "screen", route: "Knowledge", titleAr: "المعرفة القانونية", titleEn: "Legal Knowledge",
    kw: ["معرفة","مصطلح","سؤال شائع","تعريف","knowledge","term","faq","definition","glossary"] },
  { id: "reminders", type: "screen", route: "Reminders", titleAr: "التذكيرات والمهل", titleEn: "Reminders & Deadlines",
    kw: ["تذكير","مهلة","موعد","جلسة","تجديد","reminder","deadline","date","hearing","renewal"] },
  { id: "templates", type: "screen", route: "Templates", titleAr: "القوالب الجاهزة", titleEn: "Ready Templates",
    kw: ["قالب","نموذج","إنذار","إقرار","تفويض","سند","template","form","notice","acknowledgment","proxy"] },
  { id: "compare", type: "screen", route: "Compare", titleAr: "مقارنة المستندات", titleEn: "Compare Documents",
    kw: ["مقارنة","فرق","نسخة","قبل","بعد","compare","diff","version","before","after"] },
  { id: "signature", type: "screen", route: "Signature", titleAr: "التوقيع الإلكتروني", titleEn: "E-Signature",
    kw: ["توقيع","إمضاء","sign","signature","e-signature"] },
  { id: "platforms", type: "screen", route: "Platforms", titleAr: "دليل المنصات", titleEn: "Platforms Guide",
    kw: ["منصة","حكومي","platform","government","guide"] },

  // ===== المنصات الحكومية (خبراء) =====
  { id: "plat_najz", type: "screen", route: "Platforms", titleAr: "خبير ناجز", titleEn: "Expert Najiz",
    kw: ["ناجز","najiz","najz","محكمة","دعوى","تنفيذ","توثيق","صك","court","lawsuit","execution"] },
  { id: "plat_qiwa", type: "screen", route: "Platforms", titleAr: "خبير قوى", titleEn: "Expert Qiwa",
    kw: ["قوى","qiwa","عمل","نقل خدمات","عقد عمل","رخصة عمل","labor","work permit","contract"] },
  { id: "plat_ejar", type: "screen", route: "Platforms", titleAr: "خبير إيجار", titleEn: "Expert Ejar",
    kw: ["إيجار","ايجار","ejar","عقد إيجار","سكن","tenant","lease","rent"] },
  { id: "plat_absher", type: "screen", route: "Platforms", titleAr: "خبير أبشر", titleEn: "Expert Absher",
    kw: ["أبشر","ابشر","absher","جوازات","مرور","توكيل","passport","traffic"] },
  { id: "plat_gosi", type: "screen", route: "Platforms", titleAr: "خبير التأمينات", titleEn: "Expert GOSI",
    kw: ["تأمينات","gosi","ضم مدد","تقاعد","معاش","insurance","retirement","pension"] },
  { id: "plat_etimad", type: "screen", route: "Platforms", titleAr: "خبير اعتماد", titleEn: "Expert Etimad",
    kw: ["اعتماد","etimad","منافسات","مستخلص","مطالبة","procurement","claim"] },
  { id: "plat_balady", type: "screen", route: "Platforms", titleAr: "خبير بلدي", titleEn: "Expert Balady",
    kw: ["بلدي","balady","رخصة تجارية","رخصة بناء","محل","commercial license","building permit"] },
];

// تطبيع النص: حذف التشكيل، توحيد الألف والهمزات والتاء المربوطة، تصغير اللاتيني
function normalize(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "")        // التشكيل
    .replace(/[إأآا]/g, "ا")                 // توحيد الألف
    .replace(/ى/g, "ي")                      // الألف المقصورة
    .replace(/ة/g, "ه")                      // التاء المربوطة
    .replace(/ؤ/g, "و").replace(/ئ/g, "ي")  // الهمزات
    .replace(/\s+/g, " ")
    .trim();
}

// بحث ذكي: يطابق الاستعلام مع العنوانين والكلمات المفتاحية بعد التطبيع.
// يرجّع قائمة الوجهات المطابقة (مرتّبة: تطابق العنوان أولاً ثم الكلمات).
export function searchSite(query) {
  const q = normalize(query);
  if (!q) return [];
  const exact = [];
  const partial = [];
  for (const item of SEARCH_INDEX) {
    const titleAr = normalize(item.titleAr);
    const titleEn = normalize(item.titleEn);
    const inTitle = titleAr.indexOf(q) > -1 || titleEn.indexOf(q) > -1;
    const inKw = item.kw.some((k) => {
      const nk = normalize(k);
      return nk.indexOf(q) > -1 || q.indexOf(nk) > -1;
    });
    if (inTitle) exact.push(item);
    else if (inKw) partial.push(item);
  }
  return exact.concat(partial);
}
