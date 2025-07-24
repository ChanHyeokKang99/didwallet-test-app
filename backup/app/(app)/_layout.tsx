import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="ticket-detail" />
      <Stack.Screen name="ticket-qr" />
    </Stack>
  );
}
