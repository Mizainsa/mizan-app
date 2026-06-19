import { createClient } from "@supabase/supabase-js";

// إعداد روابط ومفاتيح الاتصال بـ Supabase لربط تطبيق ميزان بالسيرفر بأمان.
// تُقرأ المفاتيح أولاً من متغيرات البيئة المستقرة، ومع تعذّر ذلك أثناء
// التطوير المحلي تُستخدم القيم الاحتياطية المعتمدة للمشروع.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://lzfgjvafmvofwjiyvelq.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5";

// إنشاء العميل الموحد لكافة استعلامات قاعدة البيانات في التطبيق.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
