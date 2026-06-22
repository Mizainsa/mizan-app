import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, I18nManager, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from "@expo-google-fonts/tajawal";
import { Cairo_700Bold, Cairo_800ExtraBold, Cairo_900Black } from "@expo-google-fonts/cairo";

import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ExpertScreen from "./src/screens/ExpertScreen";
import SubscriptionScreen from "./src/screens/SubscriptionScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { COLORS } from "./src/lib/theme";
import { ThemeProvider, useTheme } from "./src/lib/ThemeContext";
import ErrorBoundary from "./src/lib/ErrorBoundary";

try {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} catch (e) {}

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const TAB_ICONS = { Home: "home", Tools: "calculator", Subscription: "crown", Settings: "user" };
const TAB_LABELS = { Home: "الرئيسية", Tools: "المساعد التقديري", Subscription: "الاشتراكات", Settings: "حسابي" };

function MainTabs() {
  const { theme: TH } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute", bottom: Platform.OS === "ios" ? 24 : 14, left: 16, right: 16,
          height: 70, borderRadius: 24, backgroundColor: TH.g2, borderTopWidth: 0,
          flexDirection: "row-reverse", justifyContent: "space-around", alignItems: "center",
          shadowColor: "#0F5132", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 20, elevation: 12,
        },
        tabBarItemStyle: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 8 },
        tabBarActiveTintColor: TH.accentLite,
        tabBarInactiveTintColor: "rgba(255,255,255,0.55)",
        tabBarLabelStyle: { fontFamily: "Cairo_700Bold", fontSize: 10, marginTop: 2 },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ color }) => <FontAwesome5 name={TAB_ICONS[route.name] || "circle"} size={18} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tools" component={ExpertScreen} initialParams={{ expert: { id: "calculators", name: "المساعد التقديري", icon: "calculator" } }} />
      <Tab.Screen name="Subscription" component={SubscriptionScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppInner() {
  const { ready } = useTheme();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.royal} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthScreen} />
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen name="Expert" component={ExpertScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold,
    Cairo_700Bold, Cairo_800ExtraBold, Cairo_900Black,
  });
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.royal} />
      </View>
    );
  }
  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <StatusBar style="light" />
          <AppInner />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
