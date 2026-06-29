// app/(admin)/config.tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../core/supabase';
import { theme } from '../../config/theme';

export default function ConfigScreen() {
  const router = useRouter();
  const [configs, setConfigs] = useState<{ key: string; value: unknown; description: string | null }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('app_config').select('*');
      setConfigs(data || []);
    })();
  }, []);

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Text style={s.title}>Remote Config</Text>
      <Text style={s.subtitle}>إعدادات التطبيق عن بُعد</Text>
      {configs.map((c) => (
        <View key={c.key} style={s.card}>
          <Text style={s.key}>{c.key}</Text>
          <Text style={s.desc}>{c.description}</Text>
          <Text style={s.value}>{JSON.stringify(c.value, null, 2)}</Text>
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
  container: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontFamily: theme.fonts.heading, color: theme.colors.textDark },
  subtitle: { fontSize: 14, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted, marginBottom: 6 },
  card: { padding: 14, backgroundColor: theme.colors.card, borderRadius: 12, gap: 6 },
  key: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.primary },
  desc: { fontSize: 13, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted },
  value: { fontSize: 12, fontFamily: 'Courier', color: theme.colors.textDark, backgroundColor: '#F5F5F5', padding: 8, borderRadius: 6 },
  back: { fontSize: 16, fontFamily: theme.fonts.bodyBold, color: theme.colors.textMuted, textAlign: 'center', marginTop: 10 },
});
