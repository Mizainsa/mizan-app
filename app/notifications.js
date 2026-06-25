import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { useLang } from '../theme/LanguageContext';
import { supabase } from '../lib/supabase';

const TYPE_ICON = { info: 'information-circle', success: 'checkmark-circle', warning: 'alert-circle' };

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const writingDir = I18nManager.isRTL ? 'rtl' : 'ltr';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  const typeColor = useCallback((ty) => {
    if (ty === 'success') return colors.emerald;
    if (ty === 'warning') return colors.gold;
    return colors.muted;
  }, [colors]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) {
        if (active) { setSignedIn(false); setLoading(false); }
        return;
      }
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, body, type, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!active) return;
      if (!error && data) {
        setItems(data);
        const unread = data.filter((n) => !n.is_read).map((n) => n.id);
        if (unread.length) {
          await supabase.from('notifications').update({ is_read: true }).in('id', unread);
        }
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.emerald, colors.emeraldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.head, { paddingTop: insets.top + 12 }]}
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={colors.goldLight} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headTitle, { writingDirection: writingDir }]}>{t('notif_title')}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : !signedIn ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={44} color={colors.muted} />
          <Text style={[styles.emptyText, { writingDirection: writingDir }]}>
            {t('notif_signin')}
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={44} color={colors.muted} />
          <Text style={[styles.emptyText, { writingDirection: writingDir }]}>{t('notif_empty')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {items.map((n) => (
            <View key={n.id} style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: typeColor(n.type) }]}>
                <Ionicons name={TYPE_ICON[n.type] || 'information-circle'} size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { writingDirection: writingDir }]}>{n.title}</Text>
                <Text style={[styles.cardBody, { writingDirection: writingDir }]}>{n.body}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(227,199,102,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { fontFamily: 'Cairo_700Bold', fontSize: 19, color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  emptyText: { fontFamily: 'Tajawal_500Medium', fontSize: 15, color: colors.muted, textAlign: 'center' },
  body: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    boxShadow: '0px 3px 10px 0px rgba(10,42,27,0.05)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: 'Cairo_700Bold', fontSize: 14.5, color: colors.textDark, marginBottom: 4 },
  cardBody: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: colors.textBody, lineHeight: 22 },
});
