export const THEMES = {
  emerald: {
    id: "emerald", name: "الزمردي",
    g1: "#0F5132", g2: "#0A3D26", g3: "#125E3A", g4: "#08311E",
    primary: "#0F5132", primaryDeep: "#0A3D26",
    accent: "#C9A227", accentLite: "#E3C766", light: "#E8F2EC",
    bg: "#FBFCFA", bgPure: "#FFFFFF", surface: "#FFFFFF", border: "#E3EFE8",
    onyx: "#0A2A1B", textBody: "#1F3D30", textDim: "#43655A", textMuted: "#8AA399",
  },
  midnight: {
    id: "midnight", name: "الليل",
    g1: "#0F1E2E", g2: "#0A1622", g3: "#13283C", g4: "#060F18",
    primary: "#13283C", primaryDeep: "#0A1622",
    accent: "#C9A227", accentLite: "#E3C766", light: "#1A2F45",
    bg: "#0A1119", bgPure: "#0F1E2E", surface: "#13283C", border: "#1F3A52",
    onyx: "#EAF2FA", textBody: "#C5D5E5", textDim: "#8AA0B5", textMuted: "#5A7088",
  },
  ocean: {
    id: "ocean", name: "المحيط",
    g1: "#0E4A5E", g2: "#093644", g3: "#125E76", g4: "#072A35",
    primary: "#0E4A5E", primaryDeep: "#093644",
    accent: "#D4A636", accentLite: "#E8C76A", light: "#E0EFF3",
    bg: "#F8FCFD", bgPure: "#FFFFFF", surface: "#FFFFFF", border: "#DCEBEF",
    onyx: "#08313D", textBody: "#1C424F", textDim: "#456069", textMuted: "#85A3AC",
  },
  sand: {
    id: "sand", name: "الرمل",
    g1: "#8A6D3B", g2: "#6E5530", g3: "#A0814A", g4: "#574426",
    primary: "#8A6D3B", primaryDeep: "#6E5530",
    accent: "#0F5132", accentLite: "#177A4B", light: "#F3ECDD",
    bg: "#FCFAF5", bgPure: "#FFFFFF", surface: "#FFFFFF", border: "#EBE3D2",
    onyx: "#3D2F16", textBody: "#4F3E22", textDim: "#6E5C3E", textMuted: "#A3927A",
  },
};

export const DEFAULT_THEME = "emerald";

export const COLORS = {
  royal: "#0F5132", royalDeep: "#0A3D26", gold: "#C9A227", goldLite: "#E3C766",
  bg: "#FBFCFA", bgPure: "#FFFFFF", surface: "#FFFFFF", border: "#E3EFE8",
  onyx: "#0A2A1B", textBody: "#1F3D30", textDim: "#43655A", textMuted: "#8AA399",
  white: "#FFFFFF", danger: "#991B1B",
};

export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 28 };

export const HUBS = [
  { id: "security", title: "الأمن والبلاغات", icon: "shield-alt",
    experts: [
      { id: "police", name: "الشرطة والبلاغات", icon: "shield-alt" },
      { id: "kollona", name: "كلنا أمن", icon: "user-shield" },
      { id: "cyber", name: "الأمن السيبراني", icon: "laptop-code" },
    ] },
  { id: "prosecution", title: "النيابة والضبط الجنائي", icon: "gavel",
    experts: [
      { id: "niyaba", name: "النيابة العامة", icon: "balance-scale-left" },
      { id: "criminal", name: "الضبط الجنائي", icon: "fingerprint" },
    ] },
  { id: "judiciary", title: "القضاء وناجز", icon: "gavel",
    experts: [
      { id: "najiz", name: "ناجز والمحاكم", icon: "landmark" },
      { id: "taradhi", name: "التراضي والصلح", icon: "handshake" },
    ] },
  { id: "family", title: "الأحوال والأسرة", icon: "users",
    experts: [
      { id: "family_law", name: "الأحوال الشخصية", icon: "users" },
      { id: "custody", name: "الحضانة والنفقة", icon: "child" },
      { id: "inherit", name: "المواريث", icon: "scroll" },
    ] },
  { id: "finance", title: "المال والضمان", icon: "coins",
    experts: [
      { id: "sama", name: "البنوك والساما", icon: "university" },
      { id: "citizen", name: "حساب المواطن", icon: "hand-holding-usd" },
      { id: "gosi", name: "التأمينات الاجتماعية", icon: "shield-alt" },
      { id: "health_ins", name: "التأمين الصحي", icon: "heartbeat" },
      { id: "commercial_ins", name: "التأمين التجاري", icon: "file-invoice-dollar" },
    ] },
  { id: "labor", title: "العمل والأفراد", icon: "briefcase",
    experts: [
      { id: "qiwa", name: "قوى والعمل", icon: "briefcase" },
      { id: "absher", name: "أبشر والجوازات", icon: "id-card" },
      { id: "musaned", name: "مساند والعمالة", icon: "hands-helping" },
    ] },
  { id: "realestate", title: "العقار والسكن", icon: "home",
    experts: [
      { id: "ejar", name: "إيجار", icon: "key" },
      { id: "ehkam", name: "إحكام العقاري", icon: "gavel" },
      { id: "mullak", name: "اتحاد الملاك", icon: "building" },
      { id: "wafi", name: "وافي للبيع على الخارطة", icon: "map-marked-alt" },
    ] },
  { id: "commerce", title: "التجارة والزكاة", icon: "store",
    experts: [
      { id: "balady", name: "بلدي والرخص", icon: "store" },
      { id: "commerce_p", name: "التجارة والسجل", icon: "file-contract" },
      { id: "zatca", name: "الزكاة والضريبة", icon: "receipt" },
    ] },
];

export const EXPERTS_COUNT = HUBS.reduce((n, h) => n + h.experts.length, 0);

export const PLATFORMS = [
  { id: "najiz", name: "ناجز", url: "https://najiz.sa" },
  { id: "qiwa", name: "قوى", url: "https://qiwa.sa" },
  { id: "absher", name: "أبشر", url: "https://absher.sa" },
  { id: "ejar", name: "إيجار", url: "https://www.ejar.sa" },
  { id: "gosi", name: "التأمينات", url: "https://www.gosi.gov.sa" },
  { id: "etimad", name: "اعتماد", url: "https://etimad.sa" },
  { id: "balady", name: "بلدي", url: "https://balady.gov.sa" },
  { id: "zatca", name: "هيئة الزكاة", url: "https://zatca.gov.sa" },
  { id: "moj", name: "وزارة العدل", url: "https://www.moj.gov.sa" },
];
