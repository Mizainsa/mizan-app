import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert, Platform, StatusBar, I18nManager, View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold } from "@expo-google-fonts/tajawal";
import { Cairo_700Bold, Cairo_800ExtraBold, Cairo_900Black } from "@expo-google-fonts/cairo";

import HomeScreen from "./src/screens/HomeScreen";
import SectionScreen from "./src/screens/SectionScreen";
import SubscriptionScreen from "./src/screens/SubscriptionScreen";
import PlatformsScreen from "./src/screens/PlatformsScreen";
import LibraryScreen from "./src/screens/LibraryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AuthScreen from "./src/screens/AuthScreen";
import CalculatorsScreen from "./src/screens/CalculatorsScreen";
import SpecializedScreen from "./src/screens/SpecializedScreen";
import DocumentsScreen from "./src/screens/DocumentsScreen";
import SearchScreen from "./src/screens/SearchScreen";
import KnowledgeScreen from "./src/screens/KnowledgeScreen";
import RemindersScreen from "./src/screens/RemindersScreen";
import TemplatesScreen from "./src/screens/TemplatesScreen";
import CompareScreen from "./src/screens/CompareScreen";
import SignatureScreen from "./src/screens/SignatureScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import { ThemeProvider, useTheme } from "./src/lib/ThemeContext";
import { registerDevice, getSettings } from "./src/lib/api";
import { initStore, closeStore, setupPurchaseListeners } from "./src/lib/payments";
import { supabase } from "./src/services/supabaseClient";
import { setPlan, cacheLiveSettings } from "./src/lib/usageLimits";
import { isLockEnabled, authenticate } from "./src/lib/biometric";
import { installGlobalErrorHandler } from "./src/lib/errorLog";
import ErrorBoundary from "./src/components/ErrorBoundary";

installGlobalErrorHandler();

try {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} catch (e) {}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function buildNavTheme(colors) {
  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      card: colors.bgPure,
      text: colors.onyx,
      border: colors.border,
      primary: colors.royal,
    },
  };
}

function HomeStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgPure },
        headerShadowVisible: false,
        headerTintColor: colors.royal,
        headerTitleStyle: { fontFamily: "Cairo_800ExtraBold", fontSize: 20, color: colors.onyx },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Section" component={SectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Platforms" component={PlatformsScreen} options={{ title: "دليل المنصات" }} />
      <Stack.Screen name="Calculators" component={CalculatorsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Specialized" component={SpecializedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Documents" component={DocumentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Knowledge" component={KnowledgeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Templates" component={TemplatesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signature" component={SignatureScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bgPure },
        headerShadowVisible: false,
        headerTintColor: colors.royal,
        headerTitleStyle: { fontFamily: "Cairo_800ExtraBold", color: colors.onyx, fontSize: 19 },
        headerTitleAlign: "center",
        sceneContainerStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 28 : 18,
          left: 20, right: 20, height: 66, borderRadius: 26,
          backgroundColor: colors.glass,
          borderWidth: 1, borderColor: colors.glassBorder,
          borderTopWidth: 1, borderTopColor: colors.glassBorder,
          shadowColor: "#0A2342", shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
          paddingBottom: Platform.OS === "ios" ? 16 : 10, paddingTop: 10,
        },
        tabBarActiveTintColor: colors.platinum,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Cairo_700Bold", fontSize: 11 },
        tabBarIcon: ({ color, focused }) => {
          const icons = { الرئيسية: "home", المكتبة: "folder-open", الاشتراكات: "crown", حسابي: "cog" };
          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <FontAwesome5 name={icons[route.name] || "circle"} size={18} color={color} solid={focused} />
              {focused && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.platinum, marginTop: 4 }} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="الرئيسية" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="المكتبة" component={LibraryScreen} options={{ title: "مكتبتي" }} />
      <Tab.Screen name="الاشتراكات" component={SubscriptionScreen} options={{ title: "الاشتراكات" }} />
      <Tab.Screen name="حسابي" component={SettingsScreen} options={{ title: "حسابي" }} />
    </Tab.Navigator>
  );
}

function AppInner() {
  const { colors, isDark, ready: themeReady } = useTheme();
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold,
    Cairo_700Bold, Cairo_800ExtraBold, Cairo_900Black,
  });

  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockChecked, setLockChecked] = useState(false);

  // فحص القفل البيومتري عند الإقلاع
  useEffect(() => {
    let mounted = true;
    (async () => {
      const enabled = await isLockEnabled();
      if (mounted) {
        setLocked(enabled);
        setLockChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tryUnlock = async () => {
    const ok = await authenticate();
    if (ok) setLocked(false);
  };

  // تهيئة الجهاز والمتجر مرة واحدة عند بدء التطبيق (كما في الأصل)
  useEffect(() => {
    let mounted = true;
    (async () => {
      let uuid = await AsyncStorage.getItem("device_uuid");
      if (!uuid) {
        uuid = "dev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
        await AsyncStorage.setItem("device_uuid", uuid);
      }
      try { await registerDevice(uuid); } catch (e) {}
      try { const settings = await getSettings(); await cacheLiveSettings(settings); } catch (e) {}
      const ok = await initStore();
      if (ok && mounted) {
        setupPurchaseListeners(
          uuid,
          (planId) => { setPlan(planId === "advanced" ? "advanced" : "pro"); Alert.alert("تم تفعيل باقتك", "تم تفعيل حصتك بنجاح. شكراً لك."); },
          () => {}
        );
      }
    })();
    return () => { mounted = false; closeStore(); };
  }, []);

  // مراقبة جلسة الدخول: تحدّد عرض شاشة الدخول أو التطبيق
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session || null);
        setAuthChecked(true);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
    });
    return () => {
      mounted = false;
      try { listener.subscription.unsubscribe(); } catch (e) {}
    };
  }, []);

  const statusBarStyle = isDark ? "light-content" : "dark-content";

  if (!fontsLoaded || !authChecked || !themeReady || !lockChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.royal} />
      </View>
    );
  }

  // قفل بيومتري مفعّل: تُعرض شاشة فتح قبل أي شيء (حتى قبل الدخول)
  if (locked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 30 }}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={colors.bg} />
        <View style={{ width: 96, height: 96, borderRadius: 30, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 1, borderColor: colors.glassBorder }}>
          <FontAwesome5 name="fingerprint" size={42} color={colors.platinum} />
        </View>
        <Text style={{ fontFamily: "Cairo_800ExtraBold", fontSize: 20, color: colors.onyx, marginBottom: 8 }}>ميزان مقفل</Text>
        <Text style={{ fontFamily: "Tajawal_500Medium", fontSize: 14, color: colors.textDim, textAlign: "center", marginBottom: 28, lineHeight: 23 }}>وثّق هويتك بالبصمة أو الوجه للدخول إلى تطبيقك.</Text>
        <TouchableOpacity onPress={tryUnlock} activeOpacity={0.9} style={{ flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.royal, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 15 }}>
          <FontAwesome5 name="unlock-alt" size={15} color={colors.white} />
          <Text style={{ fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: colors.white, marginRight: 10 }}>فتح القفل</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // غير مسجّل الدخول: تظهر بوابة الدخول. الجلسة تُلتقط تلقائياً عبر onAuthStateChange.
  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={colors.bgPure} />
        <AuthScreen onAuthSuccess={() => { /* تُحدّث الجلسة تلقائياً عبر المستمع */ }} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={buildNavTheme(colors)}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.bgPure} />
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
