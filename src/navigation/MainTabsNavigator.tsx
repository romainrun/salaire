import React from 'react';
import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/main/HomeScreen';
import { TargetSalaryScreen } from '../screens/main/TargetSalaryScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { CompareScreen } from '../features/comparison/CompareScreen';
import { useTheme } from '../features/theme/ThemeProvider';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = { Home: '💰', Compare: '⚖️', Target: '🎯', Settings: '⚙️' };
  return <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.6 }}>{icons[name] ?? '⭐'}</Text>;
}

export function MainTabsNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: bottomInset,
          height: 52 + bottomInset,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => <TabIcon name={route.name} focused={focused} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Salaire' }} />
      <Tab.Screen name="Compare" component={CompareScreen} options={{ tabBarLabel: 'Comparer' }} />
      <Tab.Screen name="Target" component={TargetSalaryScreen} options={{ tabBarLabel: 'Objectif' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Réglages' }} />
    </Tab.Navigator>
  );
}
