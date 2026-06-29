// app/(admin)/dashboard.tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../core/supabase';
import { theme } from '../../config/theme';

interface Stats {
  totalChildren: number;
  totalLessons: number;
  avgMastery: number;
  activeToday: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalChildren: 0, totalLessons: 0, avgMastery: 0, activeToday: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: children }, { count: lessons }, { data: mastery }] = await Promise.all([
        supabase.from('children').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('status', 'processed'),
        supabase.from('skill_mastery').select('mastery_score'),
      ]);

      const avg = mastery && mastery.length > 0
        ? mastery.reduce((sum: number, m: { mastery_score: number }) => sum + m.mastery_score, 0) / mastery.length
        : 0;

      setStats({
        totalChildren: children || 0,
        totalLessons: lessons || 0,
        avgMastery: Math.round(avg),
        activeToday: 0, // يمكن حسابه من streaks
      });
    })();
  }, []);

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Text style={s.title}>لوحة المالك</Text>

      <View style={s.grid}>
        <View style={[s.card, { borderLeftColor: theme.colors.primary }]}>
          <Text style={s.cardNum}>{stats.totalChildren}</Text>
          <Text style={s.cardLabel}>عدد الأطفال</Text>
        </View>
        <View style={[s.card, { borderLeftColor: theme.colors.success }]}>
          <Text style={s.cardNum}>{stats.totalLessons}</Text>
          <Text style={s.cardLabel}>دروس جاهزة</Text>
        </View>
        <View style={[s.card, { borderLeftColor: theme.colors.gem }]}>
          <Text style={s.cardNum}>{stats.avgMastery}%</Text>
          <Text style={s.cardLabel}>متوسط الإتقان</Text>
        </View>
      </View>

      <View style={s.menu}>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(admin)/semesters')}>
          <Text style={s.menuIcon}>📅</Text>
          <Text style={s.menuText}>إدارة الفصول الدراسية</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(admin)/config')}>
          <Text style={s.menuIcon}>⚙️</Text>
          <Text style={s.menuText}>Remote Config</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(admin)/content')}>
          <Text style={s.menuIcon}>📚</Text>
          <Text style={s.menuText}>إدارة المحتوى</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(admin)/growth')}>
          <Text style={s.menuIcon}>📈</Text>
          <Text style={s.menuText}>النمو الفيروسي</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.back} onPress={() => router.replace('/profiles')}>
        <Text style={s.backText}>↩ خروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: 20, gap: 20 },
  title: { fontSize: 26, fontFamily: theme.fonts.heading, color: theme.colors.textDark, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flex: 1, minWidth: 100, padding: 16, backgroundColor: theme.colors.card, borderRadius: 12, borderLeftWidth: 4 },
  cardNum: { fontSize: 28, fontFamily: theme.fonts.heading, color: theme.colors.textDark },
  cardLabel: { fontSize: 13, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted, marginTop: 4 },
  menu: { gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  menuIcon: { fontSize: 24 },
  menuText: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.textDark },
  back: { padding: 14, alignItems: 'center' },
  backText: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.textMuted },
});
