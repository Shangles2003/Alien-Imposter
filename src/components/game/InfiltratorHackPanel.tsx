import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui';
import { getAlienHackIntel } from '@/game/engine';
import { useGameAccent } from '@/context/GameAccentContext';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

interface InfiltratorHackPanelProps {
  visible: boolean;
  game: GameState;
  me: GamePlayer;
  onClose: () => void;
  onHack: (targetId: string) => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function InfiltratorHackPanel({
  visible,
  game,
  me,
  onClose,
  onHack,
}: InfiltratorHackPanelProps) {
  const { accentSoft } = useGameAccent();
  const intel = getAlienHackIntel(game);
  const canHack = game.hacksRemaining > 0;
  const humans = game.players.filter((p) => p.isAlive && p.role === 'human');
  const self = game.players.find((p) => p.uid === me.uid);
  const queuedTargetIds = new Set(intel.queued.map((q) => q.targetId));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Neural Hack</Text>
            <Text style={styles.subtitle}>Shared pool · tap anytime</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countValue}>{intel.remaining}</Text>
            <Text style={styles.countLabel}>left</Text>
          </View>
          <Pressable onPress={onClose} style={styles.doneBtn} hitSlop={12}>
            <Text style={[styles.doneText, { color: accentSoft }]}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.help}>
            Hack crew → they see infiltrator prompts. Hack yourself → you see crew prompts. Hacks
            queued mid-task apply when the next task starts.
          </Text>

          {intel.activeNow.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active this task</Text>
              {intel.activeNow.map((row) => (
                <View key={row.id} style={[styles.intelRow, styles.intelRowActive]}>
                  <Text style={styles.intelMain}>
                    {row.targetName} · {row.effectLabel}
                  </Text>
                  <Text style={styles.intelMeta}>
                    by {row.hackerName} · mission {String(row.applyAtRound).padStart(2, '0')}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {intel.queued.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Queued for next task</Text>
              {intel.queued.map((row) => (
                <View key={row.id} style={[styles.intelRow, styles.intelRowQueued]}>
                  <Text style={styles.intelMain}>
                    {row.targetName} · {row.effectLabel}
                  </Text>
                  <Text style={styles.intelMeta}>
                    by {row.hackerName} · mission {String(row.applyAtRound).padStart(2, '0')} ·{' '}
                    {formatTime(row.scheduledAt)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {intel.history.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hack log</Text>
              {[...intel.history].reverse().map((row) => (
                <View key={row.id} style={styles.intelRow}>
                  <Text style={styles.intelMain}>
                    {row.hackerName} → {row.targetName}
                  </Text>
                  <Text style={styles.intelMeta}>
                    mission {String(row.applyAtRound).padStart(2, '0')}
                    {row.appliedAt ? ` · ${formatTime(row.appliedAt)}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {canHack ? (
            <>
              <Text style={styles.sectionTitle}>Hack crew</Text>
              <Text style={styles.sectionHint}>They will see infiltrator prompts</Text>
              <View style={styles.targetList}>
                {humans.map((p) => {
                  const queued = queuedTargetIds.has(p.uid);
                  return (
                    <Pressable
                      key={p.uid}
                      disabled={queued}
                      style={({ pressed }) => [
                        styles.targetBtn,
                        queued && styles.targetBtnQueued,
                        pressed && !queued && styles.targetBtnPressed,
                      ]}
                      onPress={() => onHack(p.uid)}
                    >
                      <Avatar name={p.displayName} color={p.avatarColor} size={40} />
                      <View style={styles.targetCopy}>
                        <Text style={styles.targetName}>{p.displayName}</Text>
                        <Text style={styles.targetMeta}>
                          {queued ? 'Hack queued' : 'Give infiltrator prompts'}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {self ? (
                <>
                  <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Hack yourself</Text>
                  <Text style={styles.sectionHint}>You will see crew prompts</Text>
                  <Pressable
                    disabled={queuedTargetIds.has(self.uid)}
                    style={({ pressed }) => [
                      styles.targetBtn,
                      queuedTargetIds.has(self.uid) && styles.targetBtnQueued,
                      pressed && !queuedTargetIds.has(self.uid) && styles.targetBtnPressed,
                    ]}
                    onPress={() => onHack(self.uid)}
                  >
                    <Avatar name={self.displayName} color={self.avatarColor} size={40} />
                    <View style={styles.targetCopy}>
                      <Text style={styles.targetName}>{self.displayName} (you)</Text>
                      <Text style={styles.targetMeta}>
                        {queuedTargetIds.has(self.uid) ? 'Hack queued' : 'See correct crew prompts'}
                      </Text>
                    </View>
                  </Pressable>
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.noHacks}>No hacks remaining this mission.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a0a12' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251,113,133,0.25)',
  },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { ...typography.heading, color: colors.text, fontSize: 20 },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  countPill: {
    alignItems: 'center',
    minWidth: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(251,113,133,0.2)',
    borderWidth: 1,
    borderColor: colors.alien,
  },
  countValue: { ...typography.heading, color: colors.alien, fontSize: 18, lineHeight: 20 },
  countLabel: { ...typography.small, color: colors.alien, fontSize: 9, fontWeight: '800' },
  doneBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  doneText: { ...typography.caption, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  help: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  section: { gap: spacing.xs },
  sectionTitle: {
    ...typography.small,
    color: colors.alien,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitleSpaced: { marginTop: spacing.sm },
  sectionHint: { ...typography.small, color: colors.textDim, marginBottom: spacing.xs },
  intelRow: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  intelRowActive: { borderColor: colors.alien, backgroundColor: 'rgba(251,113,133,0.12)' },
  intelRowQueued: { borderColor: colors.secondary, backgroundColor: 'rgba(236,72,153,0.1)' },
  intelMain: { ...typography.caption, color: colors.text, fontWeight: '700' },
  intelMeta: { ...typography.small, color: colors.textMuted, fontSize: 11 },
  targetList: { gap: spacing.sm },
  targetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  targetBtnQueued: { opacity: 0.55 },
  targetBtnPressed: { opacity: 0.82, backgroundColor: colors.surfaceElevated },
  targetCopy: { flex: 1, minWidth: 0 },
  targetName: { ...typography.caption, color: colors.text, fontWeight: '700' },
  targetMeta: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  noHacks: { ...typography.caption, color: colors.textDim, textAlign: 'center', paddingVertical: spacing.lg },
});
