import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { axes } from '../../data/axes';

// محاذاة واعية للاتجاه: يمين للعربي، يسار للإنجليزي مستقبلاً
const ALIGN = I18nManager.isRTL ? 'right' : 'left';

// تحويل الأرقام إلى أرقام عربية
const toArabic = (n) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>ميزان</Text>
            <Text style={styles.brandSub}>مساعد استرشادي للتوعية</Text>
          </View>
          <Pressable style={styles.bell} hitSlop={8}>
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن خدمة أو جهة"
            placeholderTextColor={colors.muted}
            textAlign={ALIGN}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>المحاور</Text>

        <View style={styles.grid}>
          {axes.map((axis) => (
            <Pressable
              key={axis.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <Text style={styles.cardTitle}>{axis.title}</Text>
              <Text style={styles.cardCount}>{toArabic(axis.experts.length)} خبراء</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          ميزان مساعد استرشادي للتوعية، والمعلومات قد تتغيّر، ويُنصح بالتحقّق من مختصّ قبل الإجراء.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.goldLight,
    fontSize: 30,
    fontWeight: '800',
    textAlign: ALIGN,
  },
  brandSub: {
    color: colors.headerSub,
    fontSize: 13,
    marginTop: 2,
    textAlign: ALIGN,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.goldLight,
  },
  searchBox: {
    backgroundColor: colors.card,
    borderRadius: 14,
    height: 48,
    marginTop: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },
  body: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.emerald,
    textAlign: ALIGN,
    marginTop: 4,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    minHeight: 94,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  cardPressed: {
    backgroundColor: '#F2F7F4',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: ALIGN,
  },
  cardCount: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.gold,
    textAlign: ALIGN,
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
});
