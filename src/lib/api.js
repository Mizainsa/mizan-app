// ===== الاتصال بخادم ميزان (نفس الخادم الحالي rapid-function) =====
// لا نبني خادماً جديداً — التطبيق الأصلي يتصل بنفس الـ endpoints.
// أضيفت في هذه الترقية: البث الفوري للردود (streamAI) والذاكرة الدائمة،
// مع الإبقاء على askAI القديمة كما هي شبكةَ أمان.

import { fetch as expoFetch } from "expo/fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setSecure, getSecure, removeSecure } from "./secureStorage";

const PROXY_URL = "https://lzfgjvafmvofwjiyvelq.supabase.co/functions/v1/rapid-function";
const SB_KEY = "sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5";

const HEADERS = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + SB_KEY,
  "apikey": SB_KEY,
};

// نداء عام للخادم
async function callServer(body, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    return { error: "تعذّر الاتصال بالخادم. تأكد من الإنترنت." };
  }
}

// سؤال المساعد الذكي (الطريقة القديمة: رد واحد دفعة واحدة) — تبقى شبكةَ أمان
// يقبل صورة اختيارية (data URL) للتحليل البصري دون تخزينها في أي مكان.
export async function askAI(question, type = "guidance", history = [], image = null) {
  const payload = { question, type, history };
  if (image) payload.image = image;
  const d = await callServer(payload);
  if (d.error) return null;
  return d.answer || null;
}

// ===== البث الفوري للردود =====
// يستدعي الخادم بوضع stream=true، ويستقبل الرد قطعة قطعة عبر Server-Sent Events.
// onDelta(textPiece, fullSoFar): تُستدعى مع كل قطعة نص واردة لعرضها فوراً.
// onDone(fullText): تُستدعى مرة واحدة عند اكتمال الرد بالنص الكامل.
// onError(message): تُستدعى عند أي خطأ.
// ترجع دالة إيقاف يمكن استدعاؤها لإلغاء البث.
export function streamAI(question, type = "guidance", history = [], { onDelta, onDone, onError, image = null, lang = "ar" } = {}) {
  const ctrl = new AbortController();
  let cancelled = false;
  let full = "";

  (async () => {
    try {
      const reqBody = { question, type, history, stream: true };
      if (image) reqBody.image = image;
      if (lang && lang !== "ar") reqBody.lang = lang;
      const res = await expoFetch(PROXY_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(reqBody),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        let msg = "تعذّر الاتصال بالخادم. تأكد من الإنترنت.";
        try { const j = await res.json(); if (j && j.error) msg = j.error; } catch (_e) {}
        if (onError && !cancelled) onError(msg);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            if (json.error) {
              if (onError && !cancelled) onError(json.error);
              return;
            }
            if (json.delta) {
              full += json.delta;
              if (onDelta && !cancelled) onDelta(json.delta, full);
            }
          } catch (_e) { /* سطر غير مكتمل: نتجاهله */ }
        }
      }

      if (!cancelled && onDone) onDone(full);
    } catch (e) {
      if (!cancelled && onError) {
        const isAbort = e && (e.name === "AbortError" || String(e).indexOf("Abort") > -1);
        if (!isAbort) onError("تعذّر الاتصال بالخادم. تأكد من الإنترنت.");
      }
    }
  })();

  return function stop() {
    cancelled = true;
    try { ctrl.abort(); } catch (_e) {}
  };
}

// ===== الذاكرة الدائمة لكل قسم =====
// تُحفظ المحادثات محلياً على الجهاز (لا في السحابة، ولا تخص الأنظمة).
// المفتاح لكل قسم مستقل حتى لا تختلط محادثات الأقسام.
const MEM_PREFIX = "mizan_chat_";
const MEM_MAX_MESSAGES = 40; // سقف لكل قسم يمنع تضخم التخزين

function memKey(type) {
  return MEM_PREFIX + String(type || "guidance");
}

// قراءة محادثة قسم محفوظة. ترجع مصفوفة رسائل [{ id, text, isBot }] أو [].
// المحتوى مشفّر محلياً عبر طبقة التخزين الآمن.
export async function loadChat(type) {
  try {
    const raw = await getSecure(memKey(type));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_e) {
    return [];
  }
}

// حفظ محادثة قسم (مشفّرة). تقتطع تلقائياً لأحدث MEM_MAX_MESSAGES رسالة.
export async function saveChat(type, messages) {
  try {
    const arr = Array.isArray(messages) ? messages.slice(-MEM_MAX_MESSAGES) : [];
    await setSecure(memKey(type), JSON.stringify(arr));
    return true;
  } catch (_e) {
    return false;
  }
}

// مسح محادثة قسم واحد.
export async function clearChat(type) {
  try {
    await removeSecure(memKey(type));
    return true;
  } catch (_e) {
    return false;
  }
}

// تحويل رسائل الواجهة إلى صيغة التاريخ التي يفهمها الخادم
// [{ id, text, isBot }] -> [{ role, content }]
export function toHistory(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && m.id !== "welcome" && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.text }));
}

// جمع كل المحادثات المحفوظة محلياً وتحويلها إلى نص واحد قابل للتصدير.
// يبحث عن كل مفاتيح الذاكرة (mizan_chat_*) ويرتّبها. ترجع نصاً (قد يكون فارغاً).
export async function gatherAllChats() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const chatKeys = (keys || []).filter((k) => k && k.indexOf(MEM_PREFIX) === 0);
    if (!chatKeys.length) return "";
    const parts = [];
    for (const k of chatKeys) {
      const type = k.slice(MEM_PREFIX.length);
      const raw = await getSecure(k);
      if (!raw) continue;
      let arr;
      try { arr = JSON.parse(raw); } catch (_e) { continue; }
      if (!Array.isArray(arr) || !arr.length) continue;
      parts.push("=== محادثة: " + type + " ===");
      arr.forEach((m) => {
        if (m && typeof m.text === "string" && m.id !== "welcome") {
          parts.push((m.isBot ? "المساعد: " : "أنت: ") + m.text);
        }
      });
      parts.push("");
    }
    return parts.join("\n");
  } catch (_e) {
    return "";
  }
}

// ===== محلل الوسوم المهيكلة (شارة الثقة + تنبيه المهلة) =====
// يلتقط [[ثقة:...]] و [[مهلة:...]] من أول النص، ويعيد النص نظيفاً منهما
// مع معلومات العرض. آمن أثناء البث: يتجاهل الوسوم غير المكتملة بعد.
export function parseTags(text) {
  let confidence = null; // "مؤكد" | "استرشادي" | "تحقق"
  let deadline = null;   // نص المهلة
  let clean = String(text || "");

  const confMatch = clean.match(/\[\[ثقة:\s*([^\]]+)\]\]/);
  if (confMatch) {
    confidence = confMatch[1].trim();
    clean = clean.replace(confMatch[0], "");
  }
  const dlMatch = clean.match(/\[\[مهلة:\s*([^\]]+)\]\]/);
  if (dlMatch) {
    deadline = dlMatch[1].trim();
    clean = clean.replace(dlMatch[0], "");
  }
  // إزالة أي بقايا أقواس وسوم غير مكتملة أثناء التدفق
  clean = clean.replace(/\s*\[\[[^\]]*$/g, "");
  clean = clean.replace(/^\s+/, "");

  return { confidence, deadline, clean };
}

// قراءة المحتوى (الأسعار، الأسئلة، الشريط، المقترحات)
export async function getContent() {
  const d = await callServer({ action: "get_content" });
  return d.content || null;
}

// قراءة الإعدادات اللحظية العامة (حدود الباقات، تفعيل الميزات) التي تتحكم بها لوحة الإدارة
export async function getSettings() {
  const d = await callServer({ action: "get_settings" });
  return d.settings || {};
}

// تبليغ عطل للخادم (اختياري، بلا بيانات مستخدم). لا يُفشل التطبيق إن تعذّر.
export async function reportError(message, platform = "", appVersion = "") {
  try {
    await callServer({ action: "report_error", message, platform, app_version: appVersion }, 8000);
  } catch (_e) {}
}

// تسجيل دفعة حقيقية بعد الشراء من المتجر
export async function recordPayment(payment) {
  // payment = { platform, amount, currency, plan_id, device_uuid, receipt_id }
  return await callServer({ action: "record_payment", ...payment });
}

// تسجيل جهاز المستخدم (عند فتح التطبيق، لعدّ المستخدمين)
export async function registerDevice(device_uuid) {
  return await callServer({ action: "register_device", device_uuid });
}

// تسجيل نشاط الاستخدام (فتح قسم، سؤال) لإحصائيات لوحة الإدارة
export async function logActivity(activity_type, section_id = "", device_uuid = "") {
  try {
    return await callServer({ action: "log_activity", activity_type, section_id, device_uuid });
  } catch (e) {
    return null;
  }
}

export { PROXY_URL, SB_KEY };
