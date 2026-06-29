// app/(admin)/pin.tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../config/theme';

export default function AdminPinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // PIN بسيط للتجربة (في الإنتاج: تحقّق من قاعدة البيانات)
    if (pin === '9999') {
      router.replace('/(admin)/dashboard');
    } else {
      setError('PIN خاطئ');
      setPin('');
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>لوحة المالك</Text>
      <Text style={s.subtitle}>أدخل PIN للدخول</Text>
      <TextInput
        style={s.input}
        value={pin}
        onChangeText={(t) => { setPin(t); setError(''); }}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        placeholder="****"
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[s.btn, { backgroundColor: theme.colors.primary }]}
        onPress={handleSubmit}
      >
        <Text style={s.btnText}>دخول</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 28, fontFamily: theme.fonts.heading, color: theme.colors.textDark },
  subtitle: { fontSize: 16, fontFamily: theme.fonts.bodyMed, color: theme.colors.textMuted },
  input: { width: 200, padding: 16, borderWidth: 2, borderColor: theme.colors.border, borderRadius: 12, fontSize: 24, textAlign: 'center' },
  error: { color: theme.colors.error, fontSize: 14 },
  btn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#FFF', fontSize: 18, fontFamily: theme.fonts.bodyBold },
});
