import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { ReportUserModal } from '@/components/moderation/ReportUserModal';
import { useBlockList } from '@/context/BlockListContext';
import { blockUser, unblockUser } from '@/services/moderation';
import { errorMessage } from '@/utils/errors';
import { colors, radius, spacing, typography } from '@/theme';

export interface ModerationPlayer {
  uid: string;
  displayName: string;
}

interface PlayerModerationSheetProps {
  visible: boolean;
  player: ModerationPlayer | null;
  context?: string;
  onClose: () => void;
  onBlocked?: () => void;
}

export function PlayerModerationSheet({
  visible,
  player,
  context,
  onClose,
  onBlocked,
}: PlayerModerationSheetProps) {
  const { t } = useTranslation();
  const { isBlocked, refreshBlocks } = useBlockList();
  const [reportOpen, setReportOpen] = useState(false);

  if (!player) return null;

  const blocked = isBlocked(player.uid);

  const handleBlock = () => {
    Alert.alert(
      t('moderation.blockTitle', { name: player.displayName }),
      t('moderation.blockBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('moderation.block'),
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(player.uid);
              await refreshBlocks();
              onClose();
              onBlocked?.();
              Alert.alert(t('moderation.blockedTitle'), t('moderation.blockedBody', { name: player.displayName }));
            } catch (e) {
              Alert.alert(t('moderation.blockFailed'), errorMessage(e));
            }
          },
        },
      ]
    );
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(player.uid);
      await refreshBlocks();
      onClose();
      Alert.alert(t('moderation.unblockedTitle'), t('moderation.unblockedBody', { name: player.displayName }));
    } catch (e) {
      Alert.alert(t('moderation.unblockFailed'), errorMessage(e));
    }
  };

  return (
    <>
      <Modal visible={visible && !reportOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{player.displayName}</Text>
            <Text style={styles.subtitle}>{t('moderation.safetyOptions')}</Text>

            <View style={styles.actions}>
              {blocked ? (
                <Button title={t('moderation.unblock')} variant="ghost" fullWidth onPress={handleUnblock} />
              ) : (
                <Button title={t('moderation.block')} variant="ghost" fullWidth onPress={handleBlock} />
              )}
              <Button title={t('moderation.report')} variant="ghost" fullWidth onPress={() => setReportOpen(true)} />
              <Button title={t('common.cancel')} variant="ghost" fullWidth onPress={onClose} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ReportUserModal
        visible={reportOpen}
        targetId={player.uid}
        displayName={player.displayName}
        context={context}
        onClose={() => {
          setReportOpen(false);
          onClose();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderBright,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  actions: { gap: spacing.xs },
});
