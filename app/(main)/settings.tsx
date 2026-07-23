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
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES, LANGUAGES, setLanguage } from '@/i18n';
import { Button, Input, ScreenShell, Avatar, PressableScale } from '@/components/ui';
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
import { censorProfanity } from '@/utils/profanityFilter';
import { normalizeUsername, validateUsername } from '@/utils/username';
import { colors, radius, spacing, typography } from '@/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode;
const VERSION_LABEL = BUILD ? `${APP_VERSION} (${BUILD})` : APP_VERSION;

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
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language);
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
    const censored = censorProfanity(editName.trim());
    setSaving(true);
    try {
      await updateDisplayName(user.id, censored);
      await refreshProfile();
      setName(censored);
      setEditOpen(false);
    } catch (e) {
      Alert.alert(t('settings.error'), e instanceof Error ? e.message : t('settings.couldNotSaveCallsign'));
    } finally {
      setSaving(false);
    }
  };

  const showHowToPlay = () => {
    router.push('/how-to-play' as Href);
  };

  const copyPlayerId = async () => {
    if (!user?.id) return;
    const ok = await copyToClipboard(user.id);
    Alert.alert(
      ok ? t('settings.copied') : t('settings.copyFailed'),
      ok ? t('settings.playerIdCopied') : t('settings.playerIdCopyFailed')
    );
  };

  const handleLogout = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          await logOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('settings.deleteTitle'), t('settings.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteForever'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('settings.deleteSureTitle'), t('settings.deleteSureBody'), [
            { text: t('settings.keepAccount'), style: 'cancel' },
            {
              text: t('settings.deleteYes'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteAccount();
                  router.replace('/(auth)/login');
                } catch (e) {
                  Alert.alert(t('settings.deletionFailed'), errorMessage(e));
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  const handleBlockByUsername = async () => {
    const normalized = normalizeUsername(blockUsername);
    const validationError = validateUsername(normalized);
    if (validationError) {
      Alert.alert(t('auth.invalidUsername'), validationError);
      return;
    }
    if (normalized === profile?.username) {
      Alert.alert(t('settings.cannotBlock'), t('settings.cannotBlockSelf'));
      return;
    }
    setBlocking(true);
    try {
      await blockUserByUsername(normalized);
      await refreshBlocks();
      setBlockUsername('');
      setBlockOpen(false);
      Alert.alert(t('settings.blockedTitle'), t('settings.blockedBody', { name: normalized }));
    } catch (e) {
      Alert.alert(t('settings.blockFailed'), errorMessage(e));
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (blockedId: string, label: string) => {
    setUnblockingId(blockedId);
    try {
      await unblockUser(blockedId);
      await refreshBlocks();
      Alert.alert(t('settings.unblockedTitle'), t('settings.unblockedBody', { name: label }));
    } catch (e) {
      Alert.alert(t('settings.unblockFailed'), errorMessage(e));
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <ScreenShell scroll contentStyle={styles.shell}>
      <SettingsHeader title={t('settings.title')} onBack={() => router.back()} />

      <SettingsGroup delay={0}>
        <SettingsRow
          icon="👤"
          label={t('settings.username')}
          value={profile?.username ?? '—'}
        />
        <SettingsRow
          icon="✏️"
          label={t('settings.callsign')}
          value={name || t('settings.crew')}
          showChevron
          onPress={openEditCallsign}
        />
        <SettingsRow icon="❓" label={t('settings.howToPlay')} showChevron onPress={showHowToPlay} />
        <SettingsRow
          icon="🌐"
          label={t('settings.language')}
          value={currentLang?.native ?? i18n.language}
          showChevron
          isLast
          onPress={() => setLangOpen(true)}
        />
      </SettingsGroup>

      <SettingsSectionTitle>{t('settings.safety')}</SettingsSectionTitle>
      <SettingsGroup delay={40}>
        <SettingsRow
          icon="🚫"
          label={t('settings.blockByUsername')}
          showChevron
          onPress={() => setBlockOpen(true)}
        />
        <SettingsRow
          icon="📋"
          label={t('settings.blockedUsers')}
          value={blocks.length > 0 ? String(blocks.length) : undefined}
          showChevron
          isLast
          onPress={() => setBlockedOpen(true)}
        />
      </SettingsGroup>

      <SettingsSectionTitle>{t('settings.legal')}</SettingsSectionTitle>
      <SettingsGroup delay={60}>
        <SettingsRow
          icon="📜"
          label={t('settings.terms')}
          showChevron
          onPress={() => router.push('/legal/terms')}
        />
        <SettingsRow
          icon="🔒"
          label={t('settings.privacy')}
          showChevron
          isLast
          onPress={() => router.push('/legal/privacy')}
        />
      </SettingsGroup>

      <SettingsSectionTitle>{t('settings.appInfo')}</SettingsSectionTitle>
      <SettingsGroup delay={90}>
        <SettingsRow icon="ℹ️" label={t('settings.appVersion')} value={VERSION_LABEL} />
        <SettingsRow
          icon="👤"
          label={t('settings.playerId')}
          value={user?.id ? truncateId(user.id) : '—'}
          showCopy
          isLast
          onPress={copyPlayerId}
        />
      </SettingsGroup>

      <SettingsGroup delay={120}>
        <SettingsRow icon="🚪" label={t('settings.signOut')} destructive onPress={handleLogout} />
        <SettingsRow
          icon="🗑️"
          label={t('settings.deleteAccount')}
          destructive
          isLast
          onPress={handleDeleteAccount}
        />
      </SettingsGroup>

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLangOpen(false)}>
          <Pressable style={[styles.modalCard, styles.blockedCard]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('settings.chooseLanguage')}</Text>
            <ScrollView style={styles.langList}>
              {AVAILABLE_LANGUAGES.map((l) => {
                const active = l.code === i18n.language;
                return (
                  <PressableScale
                    key={l.code}
                    scaleTo={0.98}
                    onPress={async () => {
                      await setLanguage(l.code);
                      setLangOpen(false);
                    }}
                    style={[styles.langRow, active && styles.langRowActive]}
                  >
                    <View style={styles.langCopy}>
                      <Text style={styles.langNative}>{l.native}</Text>
                      <Text style={styles.langEnglish}>{l.english}</Text>
                    </View>
                    {active ? <Text style={styles.langCheck}>✓</Text> : null}
                  </PressableScale>
                );
              })}
            </ScrollView>
            <Button title={t('common.done')} fullWidth onPress={() => setLangOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('settings.editCallsign')}</Text>
            <Input
              label={t('settings.displayName')}
              value={editName}
              onChangeText={setEditName}
              placeholder={t('settings.crewNamePlaceholder')}
              autoCapitalize="words"
            />
            <View style={styles.modalActions}>
              <Button title={t('common.cancel')} variant="ghost" onPress={() => setEditOpen(false)} style={styles.modalBtn} />
              <Button
                title={t('common.save')}
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
            <Text style={styles.modalTitle}>{t('settings.blockByUsername')}</Text>
            <Input
              label={t('settings.username')}
              value={blockUsername}
              onChangeText={setBlockUsername}
              placeholder={t('settings.usernamePlaceholder')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <Button title={t('common.cancel')} variant="ghost" onPress={() => setBlockOpen(false)} style={styles.modalBtn} />
              <Button
                title={t('common.block')}
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
            <Text style={styles.modalTitle}>{t('settings.blockedUsers')}</Text>
            {blocks.length === 0 ? (
              <Text style={styles.emptyBlocked}>{t('settings.noBlockedUsers')}</Text>
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
                        title={t('settings.unblock')}
                        variant="ghost"
                        loading={unblockingId === b.blockedId}
                        onPress={() => handleUnblock(b.blockedId, label)}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <Button title={t('common.done')} fullWidth onPress={() => setBlockedOpen(false)} />
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
  langList: { maxHeight: 360 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  langRowActive: { backgroundColor: colors.glowCyan },
  langCopy: { flex: 1, minWidth: 0 },
  langNative: { ...typography.body, color: colors.text, fontWeight: '600' },
  langEnglish: { ...typography.small, color: colors.textMuted },
  langCheck: { ...typography.heading, color: colors.accent },
});
