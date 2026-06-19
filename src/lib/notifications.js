// ===== التذكيرات والإشعارات المحلية (على الجهاز فقط، بلا خادم وبلا تخزين سحابي) =====
// تذكير تجديد الرخص والإقامات والعقود، تذكير الجلسات، والملخص الأسبوعي.
// تُجدوَل محلياً عبر expo-notifications، وتُحفظ قائمتها محلياً عبر AsyncStorage.

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORE_KEY = "mizan_reminders";

// إعداد كيفية ظهور الإشعار حين يصل والتطبيق مفتوح
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// طلب إذن الإشعارات. ترجع true إن مُنح.
export async function requestNotifPermission() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
    }
    return !!granted;
  } catch (_e) {
    return false;
  }
}

// قراءة قائمة التذكيرات المحفوظة محلياً
export async function loadReminders() {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (_e) {
    return [];
  }
}

async function persist(list) {
  try { await AsyncStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (_e) {}
}

// جدولة تذكير لمرة واحدة في تاريخ محدد.
// kind: "renewal" | "hearing" | "custom" ، title: نص، date: كائن Date مستقبلي.
export async function scheduleReminder({ kind, title, date }) {
  const when = new Date(date);
  if (isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    return { ok: false, error: "اختر تاريخاً ووقتاً في المستقبل." };
  }
  const granted = await requestNotifPermission();
  if (!granted) {
    return { ok: false, error: "لتفعيل التذكير، اسمح للتطبيق بإرسال الإشعارات من إعدادات جهازك." };
  }
  try {
    const labelByKind = { renewal: "تذكير تجديد", hearing: "تذكير جلسة", custom: "تذكير" };
    const heading = labelByKind[kind] || "تذكير ميزان";
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: heading, body: title, sound: true },
      trigger: when,
    });
    const list = await loadReminders();
    list.push({ id, kind, title, date: when.toISOString() });
    await persist(list);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: "تعذّر جدولة التذكير." };
  }
}

// إلغاء تذكير
export async function cancelReminder(id) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (_e) {}
  const list = await loadReminders();
  await persist(list.filter((r) => r.id !== id));
}

// جدولة الملخص الأسبوعي: إشعار متكرر كل أسبوع في يوم وساعة محددين.
// weekday: 1 (الأحد) .. 7 (السبت) بحسب expo-notifications.
export async function scheduleWeeklySummary(weekday = 7, hour = 20) {
  const granted = await requestNotifPermission();
  if (!granted) {
    return { ok: false, error: "لتفعيل الملخص الأسبوعي، اسمح للتطبيق بالإشعارات." };
  }
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: "ملخصك الأسبوعي من ميزان", body: "اطّلع على نشاطك القانوني هذا الأسبوع وما يحتاج متابعتك.", sound: true },
      trigger: { weekday, hour, minute: 0, repeats: true },
    });
    const list = await loadReminders();
    list.push({ id, kind: "weekly", title: "الملخص الأسبوعي", date: null, weekly: true });
    await persist(list);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: "تعذّر جدولة الملخص الأسبوعي." };
  }
}
