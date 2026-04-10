import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/main/HomeScreen';
import { TargetSalaryScreen } from '../screens/main/TargetSalaryScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { useTheme } from '../features/theme/ThemeProvider';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    Home: '\ud83d\udcb0',
    Target: '\ud83c\udfaf',
    Settings: '\u2699\ufe0f',
  };
  return <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>{icons[name] ?? '\u2b50'}</Text>;
}

export function MainTabsNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Salaire' }} />
      <Tab.Screen name="Target" component={TargetSalaryScreen} options={{ tabBarLabel: 'Objectif' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'R\u00e9glages' }} />
    </Tab.Navigator>
  );
}
