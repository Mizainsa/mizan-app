// core/economy.ts
// منطق اقتصاد «عالم حكيم»: رصيد الجواهر، الكسب، الإنفاق، والمتجر.
// الرصيد الحالي يُحفظ في children.points؛ كل حركة تُسجّل في gem_transactions.

import { supabase } from './supabase';
import type { PetCatalogItem, WorldCatalogItem } from './supabase';

export interface SpendResult {
  ok: boolean;
  newBalance?: number;
  error?: string;
}

/**
 * جلب رصيد جواهر الطفل الحالي (من children.points).
 */
export async function getGemBalance(childId: string): Promise<number> {
  const { data, error } = await supabase
    .from('children')
    .select('points')
    .eq('id', childId)
    .single();
  if (error || !data) return 0;
  return data.points ?? 0;
}

/**
 * منح الطفل جواهر (مثلًا بعد اجتياز درس) + تسجيل الحركة.
 */
export async function awardGems(
  childId: string,
  amount: number,
  reason: string
): Promise<number> {
  const current = await getGemBalance(childId);
  const next = current + amount;

  await supabase.from('children').update({ points: next }).eq('id', childId);
  await supabase.from('gem_transactions').insert({
    child_id: childId,
    amount,
    reason,
  });

  // المساهمة في التحدّي العائلي (إن وُجد نشط).
  await contributeToFamilyChallenge(childId, amount);

  return next;
}

/**
 * إنفاق جواهر (شراء عنصر). يتحقّق من كفاية الرصيد.
 */
export async function spendGems(
  childId: string,
  amount: number,
  reason: string
): Promise<SpendResult> {
  const current = await getGemBalance(childId);
  if (current < amount) {
    return { ok: false, error: 'الجواهر غير كافية' };
  }
  const next = current - amount;
  await supabase.from('children').update({ points: next }).eq('id', childId);
  await supabase.from('gem_transactions').insert({
    child_id: childId,
    amount: -amount,
    reason,
  });
  return { ok: true, newBalance: next };
}

/**
 * جلب كتالوج الحيوانات الأليفة (للمتجر).
 */
export async function getPetsCatalog(): Promise<PetCatalogItem[]> {
  const { data, error } = await supabase
    .from('pets_catalog')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as PetCatalogItem[];
}

/**
 * جلب كتالوج مقتنيات الكوكب (للمتجر).
 */
export async function getWorldCatalog(): Promise<WorldCatalogItem[]> {
  const { data, error } = await supabase
    .from('world_items_catalog')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as WorldCatalogItem[];
}

/**
 * شراء حيوان أليف: يخصم السعر ويضيفه لحيوانات الطفل.
 */
export async function buyPet(
  childId: string,
  pet: PetCatalogItem
): Promise<SpendResult> {
  const res = await spendGems(childId, pet.price, `شراء ${pet.name}`);
  if (!res.ok) return res;
  await supabase.from('child_pets').insert({
    child_id: childId,
    pet_id: pet.id,
    nickname: pet.name,
    level: 1,
  });
  return res;
}

/**
 * شراء عنصر كوكب: يخصم السعر ويضيفه لمقتنيات الطفل.
 */
export async function buyWorldItem(
  childId: string,
  item: WorldCatalogItem
): Promise<SpendResult> {
  const res = await spendGems(childId, item.price, `شراء ${item.name}`);
  if (!res.ok) return res;
  await supabase.from('child_world_items').insert({
    child_id: childId,
    item_id: item.id,
    pos_x: Math.random() * 100,
    pos_y: Math.random() * 100,
  });
  return res;
}

/**
 * مساهمة جواهر الطفل في التحدّي العائلي النشط لوالده.
 * تجد التحدّي النشط وتزيد مجموعه.
 */
async function contributeToFamilyChallenge(
  childId: string,
  amount: number
): Promise<void> {
  // إيجاد وليّ أمر الطفل.
  const { data: child } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single();
  if (!child) return;

  // إيجاد التحدّي النشط.
  const { data: challenge } = await supabase
    .from('family_challenges')
    .select('id, current_total, goal, status')
    .eq('parent_id', child.parent_id)
    .eq('status', 'active')
    .single();
  if (!challenge) return;

  const newTotal = (challenge.current_total ?? 0) + amount;
  const completed = newTotal >= challenge.goal;
  await supabase
    .from('family_challenges')
    .update({
      current_total: newTotal,
      status: completed ? 'completed' : 'active',
    })
    .eq('id', challenge.id);
}
