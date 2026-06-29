// app/(admin)/content.tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, type Lesson } from '../../core/supabase';
import { theme } from '../../config/theme';

export default function ContentScreen() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('lessons').select('*').order('created_at', { ascending: false }).limit(20);
      setLessons((data as Lesson[]) || []);
    })();
  }, []);

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Text style={s.title}>إدارة المحتوى</Text>
      <Text style={s.count}>الدروس المستوعَبة: {lessons.length}</Text>
      {lessons.map((l) => (
        <View key={l.id} style={s.card}>
          <Text style={s.name}>{l.title}</Text>
          <Text style={[s.status, l.status === 'processed' && { color: theme.colors.success }]}>
            {l.status === 'processed' ? '✓ جاهز' : 'معلّق'}
          </Text>
          {l.part_number && <Text style={s.part}>الجزء {l.part_number}</Text>}
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
  container: { padding: 20, gap: 10 },
  title: { fontSize: 22, fontFamily: theme.fonts.heading, color: theme.colors.textDark },
  count: { fontSize: 14, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted, marginBottom: 6 },
  card: { padding: 12, backgroundColor: theme.colors.card, borderRadius: 10, gap: 4 },
  name: { fontSize: 15, fontFamily: theme.fonts.bodyBold, color: theme.colors.textDark },
  status: { fontSize: 13, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted },
  part: { fontSize: 12, fontFamily: theme.fonts.bodyMed, color: theme.colors.primary },
  back: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.textMuted, textAlign: 'center', marginTop: 10 },
});
