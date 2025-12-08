import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/phone" />
          <Stack.Screen name="auth/verification" />
          <Stack.Screen name="onboarding/step1" />
          <Stack.Screen name="onboarding/step2" />
          <Stack.Screen name="onboarding/success" />
          <Stack.Screen name="booking/vehicle-selection" />
          <Stack.Screen name="booking/location" />
          <Stack.Screen name="booking/wash-type" />
          <Stack.Screen name="booking/searching" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
