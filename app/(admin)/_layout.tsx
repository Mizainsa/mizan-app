// app/(admin)/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pin" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="semesters" />
      <Stack.Screen name="config" />
      <Stack.Screen name="content" />
      <Stack.Screen name="growth" />
    </Stack>
  );
}
