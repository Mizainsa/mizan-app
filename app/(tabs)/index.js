import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  I18nManager,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { axes } from '../../data/axes';

const toArabic = (n) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
const { width: SCREEN_W } = Dimensions.get('window');

const AXIS_ICON = {
  security: 'shield-outline',
  prosecution: 'document-text-outline',
  judiciary: 'business-outline',
  family: 'people-outline',
  finance: 'cash-outline',
  labor: 'briefcase-outline',
  realestate: 'home-outline',
  commerce: 'storefront-outline',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const shimmer = useRef(new Animated.Value(0)).current;

  // الاتجاه يُقرأ وقت العرض (موثوق): يمين للعربي، يسار للإنجليزي
  const isRTL = I18nManager.isRTL;
  const align = isRTL ? 'right' : 'left';
  const writingDir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 3800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_W, SCREEN_W],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.emerald, colors.emeraldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 14 }]}
      >
        <Animated.View
          style={[styles.shimmer, { transform: [{ translateX }] }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['transparent', 'rgba(245,228,160,0.30)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerFill}
          />
        </Animated.View>

        <View style={styles.headerTop}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Image
                source={require('../../assets/scale.png')}
                style={styles.scaleImg}
                resizeMode="contain"
              />
            </View>
            <MaskedView maskElement={<Text style={styles.brandName}>ميزان</Text>}>
              <LinearGradient
                colors={['#FFFFFF', '#FBEFC6', colors.goldLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={[styles.brandName, { opacity: 0 }]}>ميزان</Text>
              </LinearGradient>
            </MaskedView>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.hbtn}>
              <Text style={styles.lng}>AR</Text>
            </Pressable>
            <Pressable style={styles.hbtn}>
              <Ionicons name="notifications-outline" size={21} color={colors.goldLight} />
              <View style={styles.dot} />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.tagline, { textAlign: align, writingDirection: writingDir }]}>
          مساعدك الذكي المتخصّص — ٢٥ مختصّاً في خدمتك
        </Text>

        <View style={styles.search}>
          <Ionicons name="search" size={19} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن خدمة أو سؤال..."
            placeholderTextColor={colors.muted}
            textAlign={align}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.seclabel}>
          <View style={styles.secbar} />
          <Text style={styles.sectionTitle}>المحاور</Text>
        </View>

        <View style={styles.grid}>
          {axes.map((axis) => (
            <Pressable
              key={axis.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardEmb}>
                <Ionicons
                  name={AXIS_ICON[axis.id] || 'ellipse-outline'}
                  size={18}
                  color={colors.goldLight}
                />
              </View>
              <Text style={[styles.cardTitle, { textAlign: align, writingDirection: writingDir }]}>
                {axis.title}
              </Text>
              <Text style={[styles.cardCount, { textAlign: align, writingDirection: writingDir }]}>
                {toArabic(axis.experts.length)} خبراء
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          المعلومات قابلة للتحديث، ويُنصح باستشارة مختصّ قبل الإجراء.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  shimmer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: SCREEN_W },
  shimmerFill: { flex: 1 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(227,199,102,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(227,199,102,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleImg: { width: 36, height: 36 },
  brandName: {
    fontFamily: 'Cairo_900Black',
    fontSize: 29,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hbtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(227,199,102,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lng: {
    fontFamily: 'Cairo_800ExtraBold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E11D48',
    borderWidth: 2,
    borderColor: '#0E4A2E',
  },
  tagline: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 16,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 15,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Tajawal_400Regular',
    fontSize: 14.5,
    color: colors.textDark,
    padding: 0,
  },
  body: { padding: 18, paddingBottom: 40 },
  seclabel: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 15 },
  secbar: { width: 26, height: 3, borderRadius: 2, backgroundColor: colors.gold },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: colors.emerald },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    minHeight: 104,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9F0EB',
    padding: 15,
    marginBottom: 13,
    justifyContent: 'space-between',
  },
  cardPressed: { backgroundColor: '#F2F7F4' },
  cardEmb: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  cardTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 14.5,
    color: colors.textDark,
    lineHeight: 21,
  },
  cardCount: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 12,
    color: colors.gold,
    marginTop: 7,
  },
  disclaimer: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 11.5,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
});
