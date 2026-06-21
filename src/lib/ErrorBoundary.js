import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

// درع الأخطاء: يلتقط أي انهيار في أي شاشة، ويعرض رسالة + سبب الخطأ
// على الشاشة نفسها، بدل إغلاق التطبيق. هكذا يُرى السبب بلا طرفية.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (this.state.hasError) {
      const msg = this.state.error ? String(this.state.error.message || this.state.error) : "خطأ غير معروف";
      const stack = this.state.info && this.state.info.componentStack ? this.state.info.componentStack : "";
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>حدث خطأ في العرض</Text>
            <Text style={styles.subtitle}>التطبيق التقط الخطأ ومنع الإغلاق. التفاصيل أدناه:</Text>
            <View style={styles.box}>
              <Text style={styles.errText}>{msg}</Text>
            </View>
            {stack ? (
              <View style={styles.box}>
                <Text style={styles.stackText}>{stack.slice(0, 1200)}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.button} onPress={this.reset} activeOpacity={0.85}>
              <Text style={styles.buttonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFCFA" },
  content: { padding: 24, paddingTop: 80 },
  title: { fontFamily: "Cairo_800ExtraBold", fontSize: 22, color: "#0A2A1B", textAlign: "right", marginBottom: 8 },
  subtitle: { fontFamily: "Tajawal_500Medium", fontSize: 13, color: "#43655A", textAlign: "right", marginBottom: 20, lineHeight: 21 },
  box: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#E3EFE8" },
  errText: { fontFamily: "Tajawal_700Bold", fontSize: 13, color: "#991B1B", textAlign: "left", lineHeight: 20 },
  stackText: { fontFamily: "Tajawal_400Regular", fontSize: 10.5, color: "#666", textAlign: "left", lineHeight: 16 },
  button: { backgroundColor: "#0F5132", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  buttonText: { fontFamily: "Cairo_800ExtraBold", fontSize: 15, color: "#fff" },
});
