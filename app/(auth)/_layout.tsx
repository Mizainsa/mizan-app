// app/(auth)/_layout.tsx
// تخطيط مجموعة شاشات المصادقة (دخول/تسجيل + إعداد الأطفال).
// Stack بسيط بلا رؤوس (كل شاشة تصمّم رأسها الخاصّ).

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
