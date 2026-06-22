import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6EBE8',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
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
