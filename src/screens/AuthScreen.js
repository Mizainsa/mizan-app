import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
  Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../services/supabaseClient";
import { RADIUS } from "../lib/theme";
import { useTheme, scaled } from "../lib/ThemeContext";
import { t } from "../lib/i18n";

const { width } = Dimensions.get("window");

export default function AuthScreen({ onAuthSuccess }) {
  const { colors, fontScale, lang, dir } = useTheme();
  const en = lang === "en";
  const styles = makeStyles(colors, fontScale, dir);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // بروتوكول الموافقة القانونية
  const [termsVisible, setTermsVisible] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  // القياس الديناميكي: تُحدّث لحظة ظهور المحتوى ولحظة كل تمرير (لا قيم ثابتة)
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  // الدخول المباشر (لا يتطلب موافقة جديدة)
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) throw error;
      Alert.alert(t("alert_done", lang), t("login_welcome", lang));
      if (onAuthSuccess) onAuthSuccess(data.user);
    } catch (error) {
      Alert.alert(t("auth_fail", lang), error.message);
    } finally {
      setLoading(false);
    }
  };

  // يُستدعى عند الضغط على الزر الرئيسي
  const handleAuthAction = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("alert_note", lang), t("login_err_fields", lang));
      return;
    }
    if (isLogin) {
      await handleLogin();
    } else {
      // التسجيل: لا إنشاء حساب قبل عرض الموافقة القانونية والموافقة عليها
      setScrolledToEnd(false);
      setTermsVisible(true);
    }
  };

  // يُستدعى فقط بعد موافقة المستخدم على الشروط (زر أوافق)
  const completeSignUp = async () => {
    setLoading(true);
    try {
      // 1) إنشاء الحساب
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });
      if (error) throw error;

      // 2) توثيق الموافقة فوراً في Supabase (سجل امتثال)
      const userId = data?.user?.id;
      if (userId) {
        const { error: upErr } = await supabase
          .from("user_consents")
          .upsert(
            {
              user_id: userId,
              terms_accepted: true,
              terms_accepted_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        // 3) لا مرور للرئيسية إلا بنجاح التوثيق
        if (upErr) throw upErr;
      } else {
        throw new Error(t("consent_no_session", lang));
      }

      // نجاح كامل: إغلاق النافذة والدخول
      setTermsVisible(false);
      Alert.alert(t("alert_done", lang), t("signup_done", lang));
      if (onAuthSuccess) onAuthSuccess(data.user);
    } catch (error) {
      // فشل التوثIق: يبقى المستخدم محجوزاً، لا دخول
      Alert.alert(t("auth_fail", lang), error.message);
    } finally {
      setLoading(false);
    }
  };

  // معادلة التسامح (Tolerance Margin): يُعتبر الوصول للقاع إذا كان الفرق
  // بين ارتفاع المحتوى ومجموع (ارتفاع منطقة العرض + مقدار التمرير) أقل من 50 بكسل.
  // هذا يحلّ حساسية أندرويد الناتجة عن القيم العشرية واختلاف كثافة البكسل.
  const TOLERANCE_MARGIN = 50;

  // التقييم الموحّد: لا يُفعّل الزر إلا عند تحقّق معادلة التسامح حصراً
  const evaluateBottomReached = () => {
    const contentH = contentHeightRef.current;
    const layoutH = layoutHeightRef.current;
    const scrollY = scrollOffsetRef.current;
    if (contentH <= 0 || layoutH <= 0) return;
    const distanceFromBottom = contentH - (layoutH + scrollY);
    if (distanceFromBottom < TOLERANCE_MARGIN) {
      setScrolledToEnd(true);
    }
  };

  // رصد التمرير: يُحدّث القيم الديناميكية لحظة الحدث ثم يقيّم معادلة التسامح
  const onTermsScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    layoutHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;
    scrollOffsetRef.current = contentOffset.y;
    evaluateBottomReached();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.bgContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.logoWrapper}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="balance-scale" size={34} color={colors.white} />
            </View>
            <Text style={styles.appTitle}>{en ? "Mizan Legal App" : "تطبيق ميزان القانوني"}</Text>
            <Text style={styles.appSubtitle}>{en ? "The smart platform for laws and legal transactions" : "المنصة الذكية للأنظمة والمعاملات القانونية"}</Text>
          </View>

          <View style={styles.tabWrapper}>
            <TouchableOpacity style={[styles.tabButton, isLogin && styles.tabButtonActive]} onPress={() => setIsLogin(true)}>
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>{en ? "Login" : "تسجيل الدخول"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, !isLogin && styles.tabButtonActive]} onPress={() => setIsLogin(false)}>
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>{en ? "Sign Up" : "إنشاء حساب"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>{en ? "Email" : "البريد الإلكتروني"}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={en ? "Enter your email..." : "أدخل بريدك الإلكتروني..."}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                textAlign={dir.textAlign}
              />
              <FontAwesome5 name="envelope" size={14} color={colors.royal} style={styles.inputIcon} />
            </View>

            <Text style={styles.inputLabel}>{en ? "Password" : "كلمة المرور"}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                textAlign={dir.textAlign}
              />
              <FontAwesome5 name="lock" size={14} color={colors.royal} style={styles.inputIcon} />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAuthAction} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitText}>{isLogin ? t("secure_login_btn", lang) : t("login_setup", lang)}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* نافذة الموافقة القانونية الإجبارية — لا تسجيل بلا موافقة موثّقة */}
      <Modal visible={termsVisible} transparent animationType="fade" onRequestClose={() => { if (!loading) setTermsVisible(false); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("terms_title", lang)}</Text>
            <ScrollView
              style={styles.modalScroll}
              onScroll={onTermsScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              onContentSizeChange={(w, h) => { contentHeightRef.current = h; evaluateBottomReached(); }}
              onLayout={(ev) => { layoutHeightRef.current = ev.nativeEvent.layout.height; evaluateBottomReached(); }}
            >
              <Text style={styles.modalBody}>{t("terms_body", lang)}</Text>
            </ScrollView>
            {!scrolledToEnd && (
              <Text style={styles.scrollHint}>{t("terms_scroll_hint", lang)}</Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { if (!loading) setTermsVisible(false); }}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>{t("cancel", lang)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAgree, (!scrolledToEnd || loading) && styles.modalAgreeDisabled]}
                onPress={completeSignUp}
                disabled={!scrolledToEnd || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalAgreeText}>{t("terms_agree", lang)}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors, fontScale, dir) {
  return StyleSheet.create({
    container: { flex: 1 },
    bgContainer: { flex: 1, backgroundColor: colors.bg },
    scrollContainer: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 40, alignItems: "center" },
    logoWrapper: { alignItems: "center", marginBottom: 35 },
    iconCircle: {
      width: 84, height: 84, borderRadius: 28, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", marginBottom: 16,
      shadowColor: "#0A2342", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 6,
    },
    appTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(21, fontScale), color: colors.onyx, marginBottom: 6 },
    appSubtitle: { fontFamily: "Tajawal_500Medium", fontSize: scaled(12.5, fontScale), color: colors.textDim, textAlign: "center" },
    tabWrapper: { flexDirection: dir.row, width: "100%", height: 50, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: 28 },
    tabButton: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 11 },
    tabButtonActive: { backgroundColor: colors.royal },
    tabText: { fontFamily: "Tajawal_700Bold", fontSize: scaled(13.5, fontScale), color: colors.textDim },
    tabTextActive: { fontFamily: "Cairo_800ExtraBold", color: colors.white },
    formContainer: { width: "100%", alignItems: dir.colStart },
    inputLabel: { fontFamily: "Tajawal_700Bold", fontSize: scaled(12.5, fontScale), color: colors.royal, marginBottom: 8, paddingRight: 4 },
    inputWrapper: { flexDirection: "row", width: "100%", height: 54, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", paddingHorizontal: 16, marginBottom: 18 },
    input: { flex: 1, height: "100%", color: colors.onyx, fontFamily: "Tajawal_500Medium", fontSize: scaled(13.5, fontScale), paddingRight: 10, textAlign: dir.textAlign },
    inputIcon: { marginLeft: 6 },
    submitButton: { width: "100%", height: 54, borderRadius: 14, backgroundColor: colors.royal, alignItems: "center", justifyContent: "center", marginTop: 8, shadowColor: "#0A2342", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
    submitText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(14.5, fontScale), color: colors.white },
    // نافذة الموافقة القانونية
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
    modalCard: { width: "100%", maxWidth: 440, backgroundColor: colors.white, borderRadius: 22, padding: 22, maxHeight: "82%" },
    modalTitle: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(17, fontScale), color: colors.onyx, textAlign: dir.textAlign, marginBottom: 12 },
    modalScroll: { maxHeight: 260, marginBottom: 12 },
    modalBody: { fontFamily: "Tajawal_500Medium", fontSize: scaled(13.5, fontScale), color: colors.textDim, textAlign: dir.textAlign, lineHeight: 24 },
    scrollHint: { fontFamily: "Tajawal_500Medium", fontSize: scaled(11.5, fontScale), color: colors.royal, textAlign: "center", marginBottom: 10 },
    modalButtons: { flexDirection: dir.row, gap: 10, marginTop: 4 },
    modalCancel: { flex: 1, paddingVertical: 13, borderRadius: 14, backgroundColor: colors.bg, alignItems: "center" },
    modalCancelText: { fontFamily: "Cairo_700Bold", fontSize: scaled(13.5, fontScale), color: colors.textDim },
    modalAgree: { flex: 1.6, paddingVertical: 13, borderRadius: 14, backgroundColor: colors.royal, alignItems: "center" },
    modalAgreeDisabled: { backgroundColor: colors.platinum, opacity: 0.6 },
    modalAgreeText: { fontFamily: "Cairo_800ExtraBold", fontSize: scaled(13.5, fontScale), color: colors.white },
  });
}
