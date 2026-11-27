import { Tabs } from 'expo-router';

import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Lernen' }} />
      <Tabs.Screen name="wiederholen" options={{ title: 'Wiederholen' }} />
      <Tabs.Screen name="entdecken" options={{ title: 'Entdecken' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
