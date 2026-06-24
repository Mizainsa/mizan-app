import { useState, useEffect } from 'react';
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
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

const toArabic = (n) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

function PlanCard({ plan, featured, writingDir }) {
  const features = Array.isArray(plan.features) ? plan.features : [];
  const isFree = Number(plan.price_sar) === 0;

  return (
    <View style={[styles.card, featured && styles.cardFeatured]}>
      {featured ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>الأكثر تكاملاً</Text>
        </View>
      ) : null}

      <Text style={[styles.planName, { writingDirection: writingDir }]}>{plan.name}</Text>

      <View style={styles.priceRow}>
        {isFree ? (
          <Text style={styles.priceFree}>مجّاناً</Text>
        ) : (
          <>
            <Text style={[styles.price, featured && styles.priceGold]}>
              {toArabic(plan.price_sar)}
            </Text>
            <Text style={styles.priceUnit}>ريال / شهريّاً</Text>
          </>
        )}
      </View>

      <View style={styles.divider} />

      {features.map((f, i) => (
        <View key={i} style={styles.featRow}>
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={featured ? colors.gold : colors.emerald}
          />
          <Text style={[styles.featText, { writingDirection: writingDir }]}>{f}</Text>
        </View>
      ))}

      <Pressable
        style={[styles.cta, featured ? styles.ctaGold : styles.ctaEmerald, isFree && styles.ctaDisabled]}
        disabled={isFree}
      >
        <Text style={[styles.ctaText, featured && !isFree && styles.ctaTextDark]}>
          {isFree ? 'باقتك الحالية' : 'اشترك الآن'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const writingDir = I18nManager.isRTL ? 'rtl' : 'ltr';
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('plans')
        .select('id, name, price_sar, msg_limit, features, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!active) return;
      if (err) {
        setError(true);
      } else {
        setPlans(data || []);
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
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.headerTitle, { writingDirection: writingDir }]}>الاشتراكات</Text>
        <Text style={[styles.headerSub, { writingDirection: writingDir }]}>
          اختر ما يناسبك للوصول إلى المختصّين
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={42} color={colors.muted} />
          <Text style={[styles.errText, { writingDirection: writingDir }]}>
            تعذّر تحميل الباقات. تحقّق من الاتصال وحاول لاحقاً.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              featured={plan.id === 'advanced'}
              writingDir={writingDir}
            />
          ))}
          <Text style={styles.note}>
            المحادثة جلسة كاملة قد تتضمّن عدّة رسائل. الأسعار قابلة للتحديث.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontFamily: 'Cairo_700Bold', fontSize: 24, color: '#FFFFFF' },
  headerSub: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  errText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  body: { padding: 18, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 14px 0px rgba(10,42,27,0.06)',
  },
  cardFeatured: {
    borderColor: colors.gold,
    borderWidth: 2,
    boxShadow: '0px 8px 22px 0px rgba(201,162,39,0.22)',
  },
  badge: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    backgroundColor: colors.gold,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  badgeText: { fontFamily: 'Cairo_700Bold', fontSize: 11.5, color: '#3a2e08' },
  planName: { fontFamily: 'Cairo_700Bold', fontSize: 19, color: colors.textDark, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 },
  price: { fontFamily: 'Cairo_900Black', fontSize: 34, color: colors.emerald },
  priceGold: { color: colors.gold },
  priceFree: { fontFamily: 'Cairo_900Black', fontSize: 30, color: colors.emerald },
  priceUnit: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 },
  featText: { fontFamily: 'Tajawal_500Medium', fontSize: 13.5, color: colors.textBody, flex: 1 },
  cta: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ctaEmerald: { backgroundColor: colors.emerald },
  ctaGold: { backgroundColor: colors.gold },
  ctaDisabled: { backgroundColor: colors.border },
  ctaText: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: '#FFFFFF' },
  ctaTextDark: { color: '#3a2e08' },
  note: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 11.5,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
