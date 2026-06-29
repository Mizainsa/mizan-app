// core/supabase.ts
// عميل الاتّصال بقاعدة بيانات Supabase لتطبيق «عالم حكيم».
// المفتاح العام (anon) فقط — المفاتيح السرّية تبقى في الخادم.
// مهيّأ للجوال: تخزين الجلسة في AsyncStorage مع تحديث تلقائي.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ===== بيانات المشروع =====
const SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5';

// ===== أنواع قاعدة البيانات (Type Safety) =====
// تعكس بنية الجداول لمنع أخطاء الحقول وقت الكتابة.

export interface Parent {
  id: string;
  full_name: string | null;
  parent_pin: string | null;
  plan: 'free' | 'paid';
  plan_expires_at: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  avatar: string | null;
  grade_id: string | null;
  points: number;
  game_minutes: number;
  created_at: string;
}

export interface Stage {
  id: string;
  name: string;
  sort_order: number;
}

export interface Grade {
  id: string;
  stage_id: string;
  name: string;
  sort_order: number;
}

export interface Subject {
  id: string;
  grade_id: string;
  name: string;
}

// «الحكماء الستة» للشاشة الرئيسية (جدول hakeems) — مصدر المواد بدل مصفوفة ثابتة.
export interface HakeemEntry {
  id: string;
  key: string;
  name_ar: string;
  color: string;
  emoji: string | null;
  grade: number | null;
  sort_order: number;
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  file_path: string | null;
  content_text: string | null;
  status: 'pending' | 'processed';
  created_at: string;
}

export interface Streak {
  id: string;
  child_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  weather: 'thriving' | 'cloudy';
  updated_at: string;
}

export interface PetCatalogItem {
  id: string;
  name: string;
  asset_url: string | null;
  price: number;
  sort_order: number;
}

export interface WorldCatalogItem {
  id: string;
  name: string;
  asset_url: string | null;
  category: string | null;
  price: number;
  sort_order: number;
}

export interface FamilyChallenge {
  id: string;
  parent_id: string;
  title: string;
  goal: number;
  current_total: number;
  reward_asset_url: string | null;
  status: 'active' | 'completed';
  starts_at: string;
  ends_at: string | null;
}

// ===== إنشاء العميل =====
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
