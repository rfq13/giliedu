import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack>
      <Stack.Screen name="single-player" options={{ headerShown: false }} />
      <Stack.Screen name="ar-camera" options={{ headerShown: false }} />
      <Stack.Screen name="party-mode" options={{ headerShown: false }} />
    </Stack>
  );
}