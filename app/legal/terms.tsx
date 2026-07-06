import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TermsOfServiceView } from '@/components/legal/TermsOfServiceView';
import { ScreenShell, ScreenTopBar } from '@/components/ui';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <ScreenShell contentStyle={styles.shell}>
      <ScreenTopBar onBack={() => router.back()} />
      <View style={styles.body}>
        <TermsOfServiceView />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, paddingHorizontal: 0, paddingTop: 0 },
  body: { flex: 1, minHeight: 0 },
});
