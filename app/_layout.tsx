import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { BlockListProvider } from '@/context/BlockListContext';
import { PremiumProvider } from '@/context/PremiumContext';
import { colors } from '@/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <BlockListProvider>
      <PremiumProvider>
        <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundMid },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="lobby/join" options={{ headerShown: false }} />
        <Stack.Screen
          name="lobby/[id]"
          options={{ headerShown: false, gestureEnabled: false, fullScreenGestureEnabled: false }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{ headerShown: false, gestureEnabled: false, fullScreenGestureEnabled: false }}
        />
        <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
        <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
        <Stack.Screen
          name="paywall"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen name="deck" options={{ headerShown: false }} />
      </Stack>
      </PremiumProvider>
      </BlockListProvider>
    </AuthProvider>
  );
}
