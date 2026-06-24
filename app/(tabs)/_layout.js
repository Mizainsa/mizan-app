import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const ICONS = {
  index: 'home',
  estimator: 'calculator',
  subscriptions: 'wallet',
  account: 'person',
};

function tabIcon(routeName) {
  return ({ color, size, focused }) => (
    <Ionicons
      name={focused ? ICONS[routeName] : ICONS[routeName] + '-outline'}
      size={size}
      color={color}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Tajawal_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: tabIcon('index') }} />
      <Tabs.Screen name="estimator" options={{ title: 'المساعد التقديري', tabBarIcon: tabIcon('estimator') }} />
      <Tabs.Screen name="subscriptions" options={{ title: 'الاشتراكات', tabBarIcon: tabIcon('subscriptions') }} />
      <Tabs.Screen name="account" options={{ title: 'حسابي', tabBarIcon: tabIcon('account') }} />
    </Tabs>
  );
}
