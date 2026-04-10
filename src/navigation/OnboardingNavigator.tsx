import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { CountrySelectionScreen } from '../screens/onboarding/CountrySelectionScreen';
import { UseCaseScreen } from '../screens/onboarding/UseCaseScreen';
import { TaxConfigScreen } from '../screens/onboarding/TaxConfigScreen';
import { SummaryScreen } from '../screens/onboarding/SummaryScreen';
import { useTheme } from '../features/theme/ThemeProvider';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CountrySelection" component={CountrySelectionScreen} />
      <Stack.Screen name="UseCase" component={UseCaseScreen} />
      <Stack.Screen name="TaxConfig" component={TaxConfigScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
    </Stack.Navigator>
  );
}
