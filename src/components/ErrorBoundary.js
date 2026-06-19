// ===== حاجز الأخطاء: يمنع الشاشة البيضاء عند أي خطأ غير متوقع =====
// يلتقط أخطاء العرض، يسجّلها محلياً، ويعرض شاشة تعافٍ ودودة بدل تعطّل التطبيق.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { logError } from "../lib/errorLog";
import { LIGHT_COLORS } from "../lib/theme";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError((error && error.message) || "خطأ في العرض", (info && info.componentStack) || (error && error.stack) || "");
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const c = LIGHT_COLORS;
      return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <View style={[styles.iconCircle, { backgroundColor: c.royal, borderColor: c.glassBorder }]}>
            <FontAwesome5 name="exclamation-triangle" size={38} color={c.platinum} />
          </View>
          <Text style={[styles.title, { color: c.onyx }]}>حدث خطأ غير متوقع{"\n"}An unexpected error occurred</Text>
          <Text style={[styles.body, { color: c.textDim }]}>
            نعتذر عن ذلك. لا تقلق، بياناتك المحفوظة على جهازك سليمة. اضغط الزر أدناه للعودة والمتابعة.
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: c.royal }]} activeOpacity={0.9} onPress={this.reset}>
            <FontAwesome5 name="redo" size={14} color={c.white} />
            <Text style={[styles.buttonText, { color: c.white }]}>العودة والمتابعة · Return</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  iconCircle: { width: 96, height: 96, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 1 },
  title: { fontFamily: "Cairo_800ExtraBold", fontSize: 20, marginBottom: 10 },
  body: { fontFamily: "Tajawal_500Medium", fontSize: 14, textAlign: "center", lineHeight: 24, marginBottom: 28 },
  button: { flexDirection: "row-reverse", alignItems: "center", borderRadius: 16, paddingHorizontal: 28, paddingVertical: 15 },
  buttonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, marginRight: 10 },
});
