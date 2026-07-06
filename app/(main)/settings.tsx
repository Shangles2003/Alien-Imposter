import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Button, Input, ScreenShell, Avatar } from '@/components/ui';
import {
  SettingsGroup,
  SettingsHeader,
  SettingsRow,
  SettingsSectionTitle,
} from '@/components/settings/SettingsList';
import { useAuth } from '@/context/AuthContext';
import { useBlockList } from '@/context/BlockListContext';
import { deleteAccount, logOut, updateDisplayName } from '@/services/auth';
import { blockUserByUsername, unblockUser } from '@/services/moderation';
import { errorMessage } from '@/utils/errors';
import { normalizeUsername, validateUsername } from '@/utils/username';
import { colors, radius, spacing, typography } from '@/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode;
const VERSION_LABEL = BUILD ? `${APP_VERSION} (${BUILD})` : APP_VERSION;

const HOW_TO_PLAY = [
  'Gather 4–10 friends in a party lobby using a shared code.',
  'Complete the crew missions together — everyone plays every task.',
  'Watch the mission log for answers that do not add up.',
  'Infiltrators must blend in; crew must spot the lies.',
  'After all missions, everyone secretly ballots for the suspects they think are infiltrators. The most-accused go on trial.',
  'Majority vote ejects the accused — a tie or majority keep triggers a fresh ballot, as many times as it takes.',
  'Eject all infiltrators and the crew wins. Eject an innocent and the infiltrators win.',
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
  const { blocks, refreshBlocks } = useBlockList();
  const router = useRouter();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockUsername, setBlockUsername] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account, callsign, and game history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Are you absolutely sure?', 'Your account will be gone for good.', [
              { text: 'Keep my account', style: 'cancel' },
              {
                text: 'Yes, delete it',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAccount();
                    router.replace('/(auth)/login');
                  } catch (e) {
                    Alert.alert('Deletion failed', errorMessage(e));
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  };

  const handleBlockByUsername = async () => {
    const normalized = normalizeUsername(blockUsername);
    const validationError = validateUsername(normalized);
    if (validationError) {
      Alert.alert('Invalid username', validationError);
      return;
    }
    if (normalized === profile?.username) {
      Alert.alert('Cannot block', 'You cannot block yourself.');
      return;
    }
    setBlocking(true);
    try {
      await blockUserByUsername(normalized);
      await refreshBlocks();
      setBlockUsername('');
      setBlockOpen(false);
      Alert.alert('Blocked', `@${normalized} has been blocked.`);
    } catch (e) {
      Alert.alert('Block failed', errorMessage(e));
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (blockedId: string, label: string) => {
    setUnblockingId(blockedId);
    try {
      await unblockUser(blockedId);
      await refreshBlocks();
      Alert.alert('Unblocked', `${label} has been unblocked.`);
    } catch (e) {
      Alert.alert('Unblock failed', errorMessage(e));
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <ScreenShell scroll contentStyle={styles.shell}>
      <SettingsHeader title="Settings" onBack={() => router.back()} />

      <SettingsGroup delay={0}>
        <SettingsRow
          icon="👤"
          label="Username"
          value={profile?.username ?? '—'}
        />
        <SettingsRow
          icon="✏️"
          label="Callsign"
          value={name || 'Crew'}
          showChevron
          onPress={openEditCallsign}
        />
        <SettingsRow icon="❓" label="How to Play" showChevron isLast onPress={showHowToPlay} />
      </SettingsGroup>

      <SettingsSectionTitle>Safety</SettingsSectionTitle>
      <SettingsGroup delay={40}>
        <SettingsRow
          icon="🚫"
          label="Block by Username"
          showChevron
          onPress={() => setBlockOpen(true)}
        />
        <SettingsRow
          icon="📋"
          label="Blocked Users"
          value={blocks.length > 0 ? String(blocks.length) : undefined}
          showChevron
          isLast
          onPress={() => setBlockedOpen(true)}
        />
      </SettingsGroup>

      <SettingsSectionTitle>Legal</SettingsSectionTitle>
      <SettingsGroup delay={60}>
        <SettingsRow
          icon="📜"
          label="Terms of Service"
          showChevron
          onPress={() => router.push('/legal/terms')}
        />
        <SettingsRow
          icon="🔒"
          label="Privacy Policy"
          showChevron
          isLast
          onPress={() => router.push('/legal/privacy')}
        />
      </SettingsGroup>

      <SettingsSectionTitle>App Information</SettingsSectionTitle>
      <SettingsGroup delay={90}>
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
        <SettingsRow icon="🚪" label="Sign Out" destructive onPress={handleLogout} />
        <SettingsRow
          icon="🗑️"
          label="Delete Account"
          destructive
          isLast
          onPress={handleDeleteAccount}
        />
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

      <Modal visible={blockOpen} transparent animationType="fade" onRequestClose={() => setBlockOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBlockOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Block by Username</Text>
            <Input
              label="Username"
              value={blockUsername}
              onChangeText={setBlockUsername}
              placeholder="their_username"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setBlockOpen(false)} style={styles.modalBtn} />
              <Button
                title="Block"
                loading={blocking}
                disabled={!blockUsername.trim()}
                onPress={handleBlockByUsername}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={blockedOpen} transparent animationType="fade" onRequestClose={() => setBlockedOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBlockedOpen(false)}>
          <Pressable style={[styles.modalCard, styles.blockedCard]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Blocked Users</Text>
            {blocks.length === 0 ? (
              <Text style={styles.emptyBlocked}>No blocked users.</Text>
            ) : (
              <ScrollView style={styles.blockedList}>
                {blocks.map((b) => {
                  const label = b.username ? `@${b.username}` : b.displayName;
                  return (
                    <View key={b.blockedId} style={styles.blockedRow}>
                      <Avatar name={b.displayName} color={b.avatarColor} size={36} />
                      <View style={styles.blockedInfo}>
                        <Text style={styles.blockedName} numberOfLines={1}>{label}</Text>
                        {b.username ? (
                          <Text style={styles.blockedSub} numberOfLines={1}>{b.displayName}</Text>
                        ) : null}
                      </View>
                      <Button
                        title="Unblock"
                        variant="ghost"
                        loading={unblockingId === b.blockedId}
                        onPress={() => handleUnblock(b.blockedId, label)}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <Button title="Done" fullWidth onPress={() => setBlockedOpen(false)} />
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
  blockedCard: { maxHeight: '70%' },
  blockedList: { maxHeight: 280 },
  emptyBlocked: { ...typography.caption, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blockedInfo: { flex: 1, minWidth: 0 },
  blockedName: { ...typography.body, color: colors.text, fontWeight: '600' },
  blockedSub: { ...typography.small, color: colors.textMuted },
});
