import React from 'react';
import { Redirect, useRootNavigationState } from 'expo-router';
import { useUserStore } from '@/hooks/useUserData';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const onboardingCompleted = useUserStore((state) => state.onboardingCompleted);

  if (!rootNavigationState?.key) {
    return null;
  }

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/success" />;
}
