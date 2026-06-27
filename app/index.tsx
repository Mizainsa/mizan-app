// app/index.tsx
// البوّابة الرئيسية: تتحقّق من حالة جلسة وليّ الأمر، ثمّ توجّه:
// - لا جلسة      -> شاشة دخول وليّ الأمر (auth/login).
// - جلسة قائمة   -> شاشة اختيار الطفل (profiles).
// تعرض شاشة تحميل أنيقة أثناء الفحص (لا وميض).

import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { supabase } from '../core/supabase';
import { theme } from '../config/theme';

type AuthState = 'checking' | 'signed-in' | 'signed-out';

export default function Gate() {
  const [state, setState] = useState<AuthState>('checking');

  useEffect(() => {
    let active = true;

    // فحص الجلسة الحالية مرّة عند الإقلاع.
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setState(data.session ? 'signed-in' : 'signed-out');
    })();

    // الاستماع لتغيّر حالة المصادقة (دخول/خروج لاحق).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState(session ? 'signed-in' : 'signed-out');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // أثناء الفحص: شاشة تحميل بهوية «عالم حكيم».
  if (state === 'checking') {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>عالم حكيم</Text>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  // التوجيه حسب الحالة.
  if (state === 'signed-in') {
    return <Redirect href="/profiles" />;
  }
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  logo: {
    fontFamily: 'Cairo_900Black',
    fontSize: 32,
    color: theme.colors.primaryDark,
  },
});
