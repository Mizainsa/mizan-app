// app/(admin)/semesters.tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, type Semester } from '../../core/supabase';
import { theme } from '../../config/theme';

export default function SemestersScreen() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('semesters').select('*').order('term_number');
      setSemesters((data as Semester[]) || []);
    })();
  }, []);

  const toggleActive = async (id: string) => {
    await supabase.from('semesters').update({ is_active: false }).neq('id', id);
    await supabase.from('semesters').update({ is_active: true }).eq('id', id);
    const { data } = await supabase.from('semesters').select('*').order('term_number');
    setSemesters((data as Semester[]) || []);
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Text style={s.title}>إدارة الفصول الدراسية</Text>
      {semesters.map((sem) => (
        <View key={sem.id} style={[s.card, sem.is_active && { borderColor: theme.colors.primary, borderWidth: 2 }]}>
          <Text style={s.name}>{sem.term_name} ({sem.year_label})</Text>
          <Text style={s.sub}>الجزء {sem.part_number}</Text>
          <TouchableOpacity style={s.btn} onPress={() => toggleActive(sem.id)}>
            <Text style={s.btnText}>{sem.is_active ? '✓ نشط' : 'تفعيل'}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={s.back}>← رجوع</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontFamily: theme.fonts.heading, color: theme.colors.textDark, marginBottom: 10 },
  card: { padding: 16, backgroundColor: theme.colors.card, borderRadius: 12, gap: 6, borderWidth: 1, borderColor: theme.colors.border },
  name: { fontSize: 17, fontFamily: theme.fonts.bodyBold, color: theme.colors.textDark },
  sub: { fontSize: 14, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted },
  btn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.primaryDark, borderRadius: 8, marginTop: 6 },
  btnText: { color: '#FFF', fontSize: 14, fontFamily: theme.fonts.bodyBold },
  back: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.textMuted, textAlign: 'center', marginTop: 10 },
});
