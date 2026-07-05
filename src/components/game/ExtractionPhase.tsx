import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button } from '@/components/ui';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

export function ExtractionNominatePhase({
  game,
  onNominate,
}: {
  game: GameState;
  onNominate: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const alive = game.players.filter((p) => p.isAlive);
  const needed = game.alienCount;

  const toggle = (uid: string) => {
    setSelected((prev) => {
      if (prev.includes(uid)) return prev.filter((id) => id !== uid);
      if (prev.length >= needed) return prev;
      return [...prev, uid];
    });
  };

  return (
    <View style={styles.fill}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Final extraction</Text>
        <Text style={styles.heroDesc}>
          Tap {needed === 1 ? 'the crew member' : `${needed} crew members`} you believe{' '}
          {needed === 1 ? 'is an' : 'are'} infiltrator{needed > 1 ? 's' : ''}. Everyone must
          unanimously agree to eject them.
        </Text>
        <Text style={styles.heroHint}>
          Selected {selected.length} of {needed}
        </Text>
      </View>

      <View style={styles.targetGrid}>
        {alive.map((p) => {
          const picked = selected.includes(p.uid);
          return (
            <Pressable
              key={p.uid}
              style={[styles.targetBtn, picked && styles.targetBtnOn]}
              onPress={() => toggle(p.uid)}
            >
              <Avatar name={p.displayName} color={p.avatarColor} size={52} ring={picked} />
              <Text style={styles.targetName} numberOfLines={2}>
                {p.displayName}
              </Text>
              <Text style={styles.targetMeta}>{picked ? 'Nominated' : 'Tap to nominate'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={`Lock in nomination (${selected.length}/${needed})`}
        fullWidth
        size="md"
        disabled={selected.length !== needed}
        onPress={() => onNominate(selected)}
      />
    </View>
  );
}

export function ExtractionVotePhase({
  game,
  me,
  onVote,
}: {
  game: GameState;
  me: GamePlayer;
  onVote: (vote: 'eject' | 'keep') => void;
}) {
  const nominated = game.extraction?.nominatedIds ?? [];
  const myVote = me.extractionVote;
  const nominees = nominated
    .map((id) => game.players.find((p) => p.uid === id))
    .filter(Boolean) as GamePlayer[];

  return (
    <View style={styles.fill}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Unanimous vote</Text>
        <Text style={styles.heroDesc}>
          The crew nominated {nominees.length === 1 ? 'one suspect' : `${nominees.length} suspects`}.
          Every living crew member must vote to eject — one keep vote spares them all.
        </Text>
      </View>

      <View style={styles.nomineeList}>
        {nominees.map((p) => (
          <View key={p.uid} style={styles.nomineeCard}>
            <Avatar name={p.displayName} color={p.avatarColor} size={48} />
            <Text style={styles.nomineeName}>{p.displayName}</Text>
          </View>
        ))}
      </View>

      {myVote ? (
        <View style={styles.votedBox}>
          <Text style={styles.votedLabel}>Your vote is locked</Text>
          <Text style={styles.votedValue}>{myVote === 'eject' ? 'Eject' : 'Keep aboard'}</Text>
          <Text style={styles.votedWait}>Waiting for the rest of the crew...</Text>
        </View>
      ) : (
        <View style={styles.voteActions}>
          <Pressable
            style={({ pressed }) => [styles.ejectBtn, pressed && styles.btnPressed]}
            onPress={() => onVote('eject')}
          >
            <Text style={styles.ejectBtnText}>Eject</Text>
            <Text style={styles.ejectBtnSub}>They leave the ship</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.keepBtn, pressed && styles.btnPressed]}
            onPress={() => onVote('keep')}
          >
            <Text style={styles.keepBtnText}>Keep</Text>
            <Text style={styles.keepBtnSub}>They stay aboard</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0, justifyContent: 'space-between', gap: spacing.sm },
  hero: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.danger,
    padding: spacing.md,
    gap: spacing.xs,
  },
  heroTitle: { ...typography.heading, color: colors.text },
  heroDesc: { ...typography.caption, color: colors.textMuted, lineHeight: 20 },
  heroHint: { ...typography.small, color: colors.accentSoft, fontWeight: '800', marginTop: spacing.xs },
  targetGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignContent: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
  targetBtn: {
    width: '47%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 2,
    borderColor: colors.border,
  },
  targetBtnOn: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(244,63,94,0.12)',
  },
  targetName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
  targetMeta: { ...typography.small, color: colors.textDim, fontSize: 10 },
  nomineeList: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  nomineeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nomineeName: { ...typography.body, color: colors.text, fontWeight: '700' },
  voteActions: { flexDirection: 'row', gap: spacing.sm },
  ejectBtn: {
    flex: 1,
    minHeight: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  keepBtn: {
    flex: 1,
    minHeight: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 2,
    borderColor: colors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnPressed: { opacity: 0.88 },
  ejectBtnText: { ...typography.heading, color: '#fff' },
  ejectBtnSub: { ...typography.small, color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  keepBtnText: { ...typography.heading, color: colors.text },
  keepBtnSub: { ...typography.small, color: colors.textMuted, fontSize: 11 },
  votedBox: { gap: spacing.sm },
  votedLabel: { ...typography.caption, color: colors.textDim, textAlign: 'center' },
  votedValue: { ...typography.heading, color: colors.lime, textAlign: 'center' },
  votedWait: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
