// core/streaks.ts
// منطق السلاسل اليومية (Streaks) وطقس الكوكب الحيّ.
// السلسلة تكبر بنشاط يوميّ متتالٍ، وتنكسر بانقطاع يوم.
// طقس الكوكب يعكس حالة السلسلة: مزدهر (نشط) / غائم (منقطع).

import { supabase } from './supabase';
import type { Streak } from './supabase';

export type Weather = 'thriving' | 'cloudy';

export interface StreakState {
  current: number;
  longest: number;
  weather: Weather;
}

// فرق الأيام بين تاريخين (YYYY-MM-DD).
function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// تاريخ اليوم بصيغة YYYY-MM-DD.
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * جلب حالة سلسلة الطفل (تنشئ سجلًّا جديدًا إن لم يوجد).
 */
export async function getStreak(childId: string): Promise<StreakState> {
  const { data } = await supabase
    .from('streaks')
    .select('*')
    .eq('child_id', childId)
    .single();

  if (!data) {
    // أوّل مرّة: ننشئ سجلًّا.
    await supabase.from('streaks').insert({
      child_id: childId,
      current_streak: 0,
      longest_streak: 0,
      weather: 'thriving',
    });
    return { current: 0, longest: 0, weather: 'thriving' };
  }

  const streak = data as Streak;
  return {
    current: streak.current_streak,
    longest: streak.longest_streak,
    weather: streak.weather,
  };
}

/**
 * تسجيل نشاط اليوم: يحدّث السلسلة وطقس الكوكب.
 * - نفس اليوم: لا تغيير.
 * - اليوم التالي مباشرة: +1 للسلسلة، الطقس مزدهر.
 * - فجوة أكبر: تنكسر السلسلة (تبدأ من 1)، الطقس غائم ثمّ يتعافى.
 */
export async function recordActivity(childId: string): Promise<StreakState> {
  const { data } = await supabase
    .from('streaks')
    .select('*')
    .eq('child_id', childId)
    .single();

  const today = todayISO();

  // لا سجلّ: ننشئ سلسلة جديدة تبدأ بـ1.
  if (!data) {
    const fresh = {
      child_id: childId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      weather: 'thriving' as Weather,
    };
    await supabase.from('streaks').insert(fresh);
    return { current: 1, longest: 1, weather: 'thriving' };
  }

  const streak = data as Streak;

  // نشاط مسجّل اليوم بالفعل: لا تغيير.
  if (streak.last_active_date === today) {
    return {
      current: streak.current_streak,
      longest: streak.longest_streak,
      weather: streak.weather,
    };
  }

  const gap = streak.last_active_date
    ? daysBetween(streak.last_active_date, today)
    : 999;

  let current: number;
  let weather: Weather;

  if (gap === 1) {
    // يوم متتالٍ: السلسلة تكبر، الكوكب مزدهر.
    current = streak.current_streak + 1;
    weather = 'thriving';
  } else {
    // انقطاع: السلسلة تبدأ من جديد، الكوكب غائم.
    current = 1;
    weather = 'cloudy';
  }

  const longest = Math.max(current, streak.longest_streak);

  await supabase
    .from('streaks')
    .update({
      current_streak: current,
      longest_streak: longest,
      last_active_date: today,
      weather,
      updated_at: new Date().toISOString(),
    })
    .eq('child_id', childId);

  return { current, longest, weather };
}
