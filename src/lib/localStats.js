// ===== إحصاءات المستخدم الشخصية محلياً (بلا خادم، بلا ربط) =====
// عدّادات بسيطة على الجهاز لعرض نشاط المستخدم في لوحته الشخصية.

import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "mizan_local_stats";

const EMPTY = { questions: 0, documents: 0, byMonth: {} };

function monthKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export async function getStats() {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    const s = raw ? JSON.parse(raw) : null;
    if (!s || typeof s !== "object") return { ...EMPTY };
    return { questions: s.questions || 0, documents: s.documents || 0, byMonth: s.byMonth || {} };
  } catch (_e) {
    return { ...EMPTY };
  }
}

async function bump(field) {
  try {
    const s = await getStats();
    s[field] = (s[field] || 0) + 1;
    const mk = monthKey();
    s.byMonth[mk] = s.byMonth[mk] || { questions: 0, documents: 0 };
    s.byMonth[mk][field] = (s.byMonth[mk][field] || 0) + 1;
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch (_e) {}
}

export function recordQuestionStat() { return bump("questions"); }
export function recordDocumentStat() { return bump("documents"); }

// آخر ستة أشهر للأسئلة (لرسم بسيط)
export async function lastSixMonths() {
  const s = await getStats();
  const out = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const mk = dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0");
    out.push({ month: mk, questions: (s.byMonth[mk] && s.byMonth[mk].questions) || 0 });
  }
  return out;
}
