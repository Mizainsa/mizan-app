// app/(parent)/_layout.tsx
// تخطيط مجموعة شاشات وليّ الأمر (بوّابة PIN + لوحة التحكّم).
// Stack بسيط بلا رؤوس افتراضية.

import { Stack } from 'expo-router';

export default function ParentLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
