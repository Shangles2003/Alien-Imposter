import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MissionLogEntry } from '@/components/game/MissionLogEntry';
import { PlayerModerationSheet, ModerationPlayer } from '@/components/moderation/PlayerModerationSheet';
import { Avatar } from '@/components/ui';
import { isDevBot } from '@/dev/config';
import { useGameAccent } from '@/context/GameAccentContext';
import { getAlienHackIntel } from '@/game/engine';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

interface MissionLogModalProps {
  visible: boolean;
  game: GameState;
  me: GamePlayer;
  onClose: () => void;
}

export function MissionLogModal({ visible, game, me, onClose }: MissionLogModalProps) {
  const { accentSoft } = useGameAccent();
  const intel = me.role === 'alien' ? getAlienHackIntel(game) : null;
  const [moderatePlayer, setModeratePlayer] = useState<ModerationPlayer | null>(null);

  const crewmates = game.players.filter((p) => p.uid !== me.uid && !isDevBot(p.uid));

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Mission log</Text>
              <Text style={styles.subtitle}>Every answer from every task</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={[styles.closeText, { color: accentSoft }]}>Done</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {crewmates.length > 0 ? (
              <View style={styles.crewSection}>
                <Text style={styles.crewTitle}>Crew</Text>
                {crewmates.map((p) => (
                  <View key={p.uid} style={styles.crewRow}>
                    <Avatar name={p.displayName} color={p.avatarColor} size={32} />
                    <Text style={styles.crewName} numberOfLines={1}>
                      {p.displayName}
                    </Text>
                    <Pressable
                      onPress={() => setModeratePlayer({ uid: p.uid, displayName: p.displayName })}
                      hitSlop={12}
                      style={styles.menuBtn}
                    >
                      <Text style={styles.menuIcon}>⋯</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {intel ? (
              <View style={styles.intelBox}>
                <View style={styles.intelHeader}>
                  <Text style={styles.intelTitle}>Infiltrator intel</Text>
                  <Text style={styles.intelCount}>
                    {intel.remaining}/{intel.total} hacks left
                  </Text>
                </View>
                {intel.activeNow.length > 0 ? (
                  <Text style={styles.intelLine}>
                    Active: {intel.activeNow.map((r) => r.targetName).join(', ')}
                  </Text>
                ) : null}
                {intel.queued.length > 0 ? (
                  <Text style={styles.intelLine}>
                    Queued: {intel.queued.map((r) => `${r.targetName} (M${r.applyAtRound})`).join(', ')}
                  </Text>
                ) : null}
                {intel.history.length === 0 && intel.queued.length === 0 && intel.activeNow.length === 0 ? (
                  <Text style={styles.intelLine}>No hacks used yet — tap Hack in the HUD.</Text>
                ) : null}
              </View>
            ) : null}

            {game.history.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nothing logged yet</Text>
                <Text style={styles.emptyDesc}>Completed tasks and crew answers will show up here.</Text>
              </View>
            ) : (
              [...game.history].reverse().map((entry) => (
                <MissionLogEntry key={`${entry.round}-${entry.completedAt}`} entry={entry} game={game} compact />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <PlayerModerationSheet
        visible={moderatePlayer !== null}
        player={moderatePlayer}
        context={`game:${game.id}`}
        onClose={() => setModeratePlayer(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundMid },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  closeBtn: {
    backgroundColor: colors.surfaceSolid,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderBright,
  },
  closeText: { ...typography.caption, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  crewSection: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  crewTitle: { ...typography.caption, color: colors.textMuted, fontWeight: '800', marginBottom: spacing.xs },
  crewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  crewName: { ...typography.body, color: colors.text, flex: 1, minWidth: 0 },
  menuBtn: { paddingHorizontal: spacing.xs },
  menuIcon: { fontSize: 20, color: colors.textDim, fontWeight: '700' },
  intelBox: {
    backgroundColor: 'rgba(251,113,133,0.1)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.35)',
    gap: spacing.xs,
  },
  intelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  intelTitle: { ...typography.caption, color: colors.alien, fontWeight: '800' },
  intelCount: { ...typography.small, color: colors.text, fontWeight: '700' },
  intelLine: { ...typography.caption, color: colors.textMuted, lineHeight: 20 },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.heading, color: colors.textMuted },
  emptyDesc: { ...typography.caption, color: colors.textDim, textAlign: 'center' },
});
