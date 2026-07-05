import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Button, Input, ScreenShell } from '@/components/ui';
import {
  SettingsGroup,
  SettingsHeader,
  SettingsRow,
  SettingsSectionTitle,
} from '@/components/settings/SettingsList';
import { PremiumSettingsSection } from '@/components/settings/PremiumSettingsSection';
import { useAuth } from '@/context/AuthContext';
import { logOut, updateDisplayName } from '@/services/auth';
import { colors, radius, spacing, typography } from '@/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode;
const VERSION_LABEL = BUILD ? `${APP_VERSION} (${BUILD})` : APP_VERSION;

const HOW_TO_PLAY = [
  'Gather 4–10 friends in a party lobby using a shared code.',
  'Complete 5 crew missions together — everyone plays every task.',
  'Watch the mission log for answers that do not add up.',
  'Infiltrators must blend in; crew must spot the lies.',
  'After all missions, vote unanimously to eject suspected infiltrators.',
  'Crew wins if all infiltrators are caught. Infiltrators win if they survive.',
].join('\n\n');

function truncateId(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export default function SettingsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.displayName ?? '');
  }, [profile?.displayName]);

  const openEditCallsign = () => {
    setEditName(name);
    setEditOpen(true);
  };

  const saveCallsign = async () => {
    if (!user || !editName.trim()) return;
    setSaving(true);
    try {
      await updateDisplayName(user.id, editName.trim());
      await refreshProfile();
      setName(editName.trim());
      setEditOpen(false);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save callsign');
    } finally {
      setSaving(false);
    }
  };

  const showHowToPlay = () => {
    Alert.alert('How to Play', HOW_TO_PLAY);
  };

  const copyPlayerId = async () => {
    if (!user?.id) return;
    const ok = await copyToClipboard(user.id);
    Alert.alert(ok ? 'Copied' : 'Copy failed', ok ? 'Player ID copied to clipboard.' : 'Could not copy ID.');
  };

  const handleLogout = () => {
    Alert.alert('Sign out?', 'You will need to log in again to join a party.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScreenShell scroll contentStyle={styles.shell}>
      <SettingsHeader title="Settings" onBack={() => router.back()} />

      <SettingsGroup delay={0}>
        <SettingsRow
          icon="✏️"
          label="Callsign"
          value={name || 'Crew'}
          showChevron
          onPress={openEditCallsign}
        />
        <SettingsRow icon="❓" label="How to Play" showChevron isLast onPress={showHowToPlay} />
      </SettingsGroup>

      <PremiumSettingsSection />

      <SettingsSectionTitle>App Information</SettingsSectionTitle>
      <SettingsGroup delay={60}>
        <SettingsRow icon="ℹ️" label="App Version" value={VERSION_LABEL} />
        <SettingsRow
          icon="👤"
          label="Player ID"
          value={user?.id ? truncateId(user.id) : '—'}
          showCopy
          isLast
          onPress={copyPlayerId}
        />
      </SettingsGroup>

      <SettingsGroup delay={120}>
        <SettingsRow icon="🚪" label="Sign Out" destructive isLast onPress={handleLogout} />
      </SettingsGroup>

      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit Callsign</Text>
            <Input
              label="Display name"
              value={editName}
              onChangeText={setEditName}
              placeholder="Your crew name"
              autoCapitalize="words"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setEditOpen(false)} style={styles.modalBtn} />
              <Button
                title="Save"
                loading={saving}
                disabled={!editName.trim()}
                onPress={saveCallsign}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderBright,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtn: { flex: 1 },
});
