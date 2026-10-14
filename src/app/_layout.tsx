import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { selectIsSignedIn, useAuthStore } from '@/store/auth';

// ---------------------------------------------------------------------------
// اتجاه الواجهة من اليمين لليسار
// - على الموبايل: I18nManager (مع app.json → expo-localization forcesRTL)
// - على الويب: سمة dir="rtl" على عنصر html (انظر +html.tsx أيضاً)
// ---------------------------------------------------------------------------
if (Platform.OS === 'web') {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }
} else {
  I18nManager.allowRTL(true);
  if (!I18nManager.isRTL) {
    // يسري بعد إعادة تشغيل التطبيق (في Expo Go أغلق التطبيق وافتحه مرة أخرى)
    I18nManager.forceRTL(true);
  }
}

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 300 });

export const unstable_settings = {
  // عند فتح رابط عميق يبقى التبويب الرئيسي هو نقطة الرجوع
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isSignedIn = useAuthStore(selectIsSignedIn);

  const ready = (fontsLoaded || !!fontError) && hasHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_left', // في RTL الشاشات تدخل من اليسار
          }}>
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="store/[id]" />
            <Stack.Screen name="category/[id]" />
            <Stack.Screen name="search" options={{ animation: 'fade' }} />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="order-success" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="order/[id]" />
            <Stack.Screen name="addresses" />
            <Stack.Screen name="address-form" options={{ presentation: 'modal' }} />
            <Stack.Screen name="profile-edit" options={{ presentation: 'modal' }} />
            <Stack.Screen
              name="product/[id]"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack.Protected>

          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
