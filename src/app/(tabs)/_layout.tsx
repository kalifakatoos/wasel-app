import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { Platform, type ColorValue } from 'react-native';

import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { selectCartCount, useCartStore } from '@/store/cart';
import { selectActiveOrdersCount, useOrdersStore } from '@/store/orders';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const cartCount = useCartStore(selectCartCount);
  const activeOrders = useOrdersStore(selectActiveOrdersCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Platform.OS === 'web' ? 64 : undefined,
          paddingTop: 6,
        },
        tabBarBadgeStyle: {
          backgroundColor: Colors.accent,
          color: Colors.text,
          fontFamily: FontFamily.bold,
          fontSize: 10,
        },
        sceneStyle: { backgroundColor: Colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.home, tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t.tabs.orders,
          tabBarIcon: tabIcon('receipt', 'receipt-outline'),
          tabBarBadge: activeOrders > 0 ? activeOrders : undefined,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t.tabs.cart,
          tabBarIcon: tabIcon('cart', 'cart-outline'),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t.tabs.profile, tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
