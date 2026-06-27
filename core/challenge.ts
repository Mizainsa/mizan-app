// core/challenge.ts
// منطق التحدّي العائلي المشترك: يجمع إسهام كل أطفال العائلة نحو هدف
// جماعي (مثلًا ١٠٠٠ جوهرة -> مكافأة مشتركة). يحفّز الإخوة على التعلّم معًا.

import { supabase } from './supabase';
import type { FamilyChallenge, Child } from './supabase';

export interface ChallengeContributor {
  childId: string;
  name: string;
  contribution: number;
}

export interface ChallengeView {
  challenge: FamilyChallenge | null;
  contributors: ChallengeContributor[];
  progress: number; // 0..1
}

/**
 * جلب التحدّي العائلي النشط لوالد طفل معيّن + إسهام كل طفل.
 */
export async function getFamilyChallenge(childId: string): Promise<ChallengeView> {
  // إيجاد وليّ أمر الطفل.
  const { data: child } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single();
  if (!child) return { challenge: null, contributors: [], progress: 0 };

  // التحدّي النشط.
  const { data: challenge } = await supabase
    .from('family_challenges')
    .select('*')
    .eq('parent_id', child.parent_id)
    .eq('status', 'active')
    .single();
  if (!challenge) return { challenge: null, contributors: [], progress: 0 };

  const ch = challenge as FamilyChallenge;

  // كل أطفال العائلة (لعرض إسهامهم بصريًّا).
  const { data: kids } = await supabase
    .from('children')
    .select('id, name, points')
    .eq('parent_id', child.parent_id);

  const contributors: ChallengeContributor[] = (kids ?? []).map((k: Partial<Child>) => ({
    childId: k.id as string,
    name: k.name as string,
    contribution: k.points ?? 0,
  }));

  const progress = ch.goal > 0 ? Math.min(1, ch.current_total / ch.goal) : 0;

  return { challenge: ch, contributors, progress };
}

/**
 * إنشاء تحدٍّ عائلي جديد (يُستدعى من لوحة وليّ الأمر).
 */
export async function createFamilyChallenge(
  parentId: string,
  title: string,
  goal: number,
  rewardAssetUrl?: string
): Promise<boolean> {
  const { error } = await supabase.from('family_challenges').insert({
    parent_id: parentId,
    title,
    goal,
    current_total: 0,
    reward_asset_url: rewardAssetUrl ?? null,
    status: 'active',
  });
  return !error;
}
