import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell } from '@/components/ui';
import { PremiumPaywall } from '@/components/premium/PremiumPaywall';
import { HOME_ROUTE } from '@/navigation/routes';

export default function PaywallScreen() {
  const router = useRouter();

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace(HOME_ROUTE);
  };

  return (
    <ScreenShell contentStyle={styles.shell}>
      <PremiumPaywall onClose={close} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
});
