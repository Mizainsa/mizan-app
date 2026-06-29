// app/(admin)/growth.tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../core/supabase';
import { theme } from '../../config/theme';

export default function GrowthScreen() {
  const router = useRouter();
  const [totalReferrals, setTotalReferrals] = useState(0);

  useEffect(() => {
    (async () => {
      const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true });
      setTotalReferrals(count || 0);
    })();
  }, []);

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Text style={s.title}>النمو الفيروسي</Text>
      <View style={s.card}>
        <Text style={s.num}>{totalReferrals}</Text>
        <Text style={s.label}>إحالات إجمالية</Text>
      </View>
      <Text style={s.note}>تتبع روابط الدعوة والإحالات من جدول referrals</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={s.back}>← رجوع</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: 20, gap: 16, alignItems: 'center' },
  title: { fontSize: 22, fontFamily: theme.fonts.heading, color: theme.colors.textDark, alignSelf: 'flex-start' },
  card: { width: '100%', padding: 24, backgroundColor: theme.colors.card, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.primary },
  num: { fontSize: 48, fontFamily: theme.fonts.heading, color: theme.colors.primary },
  label: { fontSize: 16, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted, marginTop: 6 },
  note: { fontSize: 13, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted, textAlign: 'center', maxWidth: 280 },
  back: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.textMuted, marginTop: 20 },
});
