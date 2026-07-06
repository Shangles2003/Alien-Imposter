import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const { isBlocked, refreshBlocks } = useBlockList();
  const [reportOpen, setReportOpen] = useState(false);

  if (!player) return null;

  const blocked = isBlocked(player.uid);

  const handleBlock = () => {
    Alert.alert(
      `Block ${player.displayName}?`,
      'They will not be able to join lobbies with you. You can unblock them in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(player.uid);
              await refreshBlocks();
              onClose();
              onBlocked?.();
              Alert.alert('Blocked', `${player.displayName} has been blocked.`);
            } catch (e) {
              Alert.alert('Block failed', errorMessage(e));
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
      Alert.alert('Unblocked', `${player.displayName} has been unblocked.`);
    } catch (e) {
      Alert.alert('Unblock failed', errorMessage(e));
    }
  };

  return (
    <>
      <Modal visible={visible && !reportOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{player.displayName}</Text>
            <Text style={styles.subtitle}>Safety options</Text>

            <View style={styles.actions}>
              {blocked ? (
                <Button title="Unblock" variant="ghost" fullWidth onPress={handleUnblock} />
              ) : (
                <Button title="Block" variant="ghost" fullWidth onPress={handleBlock} />
              )}
              <Button title="Report" variant="ghost" fullWidth onPress={() => setReportOpen(true)} />
              <Button title="Cancel" variant="ghost" fullWidth onPress={onClose} />
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
