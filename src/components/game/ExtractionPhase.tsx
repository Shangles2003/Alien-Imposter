import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Avatar, Button } from '@/components/ui';
import { GamePlayer, GameState } from '@/types/game';
import { colors, radius, shadows, spacing, typography } from '@/theme';

/** Pulsing red alert strip — sets the mood for the final vote. */
function AlertStrip({ label }: { label: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.45,
  }));

  return (
    <Animated.View style={[styles.alertStrip, style]}>
      <Text style={styles.alertText}>⚠ {label} ⚠</Text>
    </Animated.View>
  );
}

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
      <Animated.View entering={FadeInDown.duration(400)}>
        <AlertStrip label="FINAL EXTRACTION" />
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Who are the infiltrators?</Text>
          <Text style={styles.heroDesc}>
            Tap {needed === 1 ? 'the crew member' : `${needed} crew members`} you believe{' '}
            {needed === 1 ? 'is an' : 'are'} infiltrator{needed > 1 ? 's' : ''}. Everyone must
            unanimously agree to eject them.
          </Text>
          <Text style={styles.heroHint}>
            SELECTED {selected.length} OF {needed}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.targetGrid}>
        {alive.map((p, i) => {
          const picked = selected.includes(p.uid);
          return (
            <Animated.View
              key={p.uid}
              entering={FadeInUp.delay(50 * i).duration(300)}
              style={styles.targetItem}
            >
              <Pressable
                style={[styles.targetBtn, picked && styles.targetBtnOn]}
                onPress={() => toggle(p.uid)}
              >
                <Avatar name={p.displayName} color={p.avatarColor} size={52} ring={picked} />
                <Text style={styles.targetName} numberOfLines={2}>
                  {p.displayName}
                </Text>
                <Text style={[styles.targetMeta, picked && styles.targetMetaOn]}>
                  {picked ? 'NOMINATED' : 'Tap to nominate'}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Button
        title={
          selected.length === needed
            ? 'Lock in nomination'
            : `Select ${needed - selected.length} more`
        }
        variant="danger"
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

  const alive = game.players.filter((p) => p.isAlive);
  const votesIn = Object.keys(game.extraction?.votes ?? {}).length;

  return (
    <View style={styles.fill}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <AlertStrip label="UNANIMOUS VOTE REQUIRED" />
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Eject the suspects?</Text>
          <Text style={styles.heroDesc}>
            The crew nominated {nominees.length === 1 ? 'one suspect' : `${nominees.length} suspects`}.
            Every living crew member must vote to eject — one keep vote spares them all.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.nomineeList}>
        {nominees.map((p, i) => (
          <Animated.View
            key={p.uid}
            entering={FadeInUp.delay(120 * i).duration(350)}
            style={styles.nomineeCard}
          >
            <Avatar name={p.displayName} color={p.avatarColor} size={48} />
            <View style={styles.nomineeCopy}>
              <Text style={styles.nomineeName}>{p.displayName}</Text>
              <Text style={styles.nomineeMeta}>ACCUSED OF INFILTRATION</Text>
            </View>
          </Animated.View>
        ))}
        <Text style={styles.voteCount}>
          {votesIn}/{alive.length} votes in
        </Text>
      </View>

      {myVote ? (
        <View style={styles.votedBox}>
          <Text style={styles.votedLabel}>Your vote is locked</Text>
          <Text style={[styles.votedValue, myVote === 'keep' && styles.votedKeep]}>
            {myVote === 'eject' ? 'EJECT' : 'KEEP ABOARD'}
          </Text>
          <Text style={styles.votedWait}>Waiting for the rest of the crew...</Text>
        </View>
      ) : (
        <View style={styles.voteActions}>
          <Pressable
            style={({ pressed }) => [styles.ejectBtn, shadows.glowRed, pressed && styles.btnPressed]}
            onPress={() => onVote('eject')}
          >
            <Text style={styles.ejectBtnText}>EJECT</Text>
            <Text style={styles.ejectBtnSub}>They leave the ship</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.keepBtn, pressed && styles.btnPressed]}
            onPress={() => onVote('keep')}
          >
            <Text style={styles.keepBtnText}>KEEP</Text>
            <Text style={styles.keepBtnSub}>They stay aboard</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0, justifyContent: 'space-between', gap: spacing.sm },
  alertStrip: {
    backgroundColor: 'rgba(251,77,109,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(251,77,109,0.4)',
    borderRadius: radius.sm,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertText: { ...typography.label, color: colors.danger, fontSize: 11 },
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
  heroHint: { ...typography.label, color: colors.accentSoft, marginTop: spacing.xs },
  targetGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignContent: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
  targetItem: { width: '47%' },
  targetBtn: {
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
    backgroundColor: 'rgba(251,77,109,0.12)',
  },
  targetName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
  targetMeta: { ...typography.small, color: colors.textDim, fontSize: 10 },
  targetMetaOn: { color: colors.danger, fontWeight: '800' },
  nomineeList: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  nomineeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: 'rgba(251,77,109,0.35)',
  },
  nomineeCopy: { flex: 1, minWidth: 0 },
  nomineeName: { ...typography.body, color: colors.text, fontWeight: '700' },
  nomineeMeta: { ...typography.label, color: colors.danger, fontSize: 8, marginTop: 2 },
  voteCount: { ...typography.small, color: colors.textDim, textAlign: 'center' },
  voteActions: { flexDirection: 'row', gap: spacing.sm },
  ejectBtn: {
    flex: 1,
    minHeight: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerDark,
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
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  ejectBtnText: { ...typography.heading, color: '#fff', letterSpacing: 1 },
  ejectBtnSub: { ...typography.small, color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  keepBtnText: { ...typography.heading, color: colors.text, letterSpacing: 1 },
  keepBtnSub: { ...typography.small, color: colors.textMuted, fontSize: 11 },
  votedBox: { gap: spacing.sm, paddingVertical: spacing.sm },
  votedLabel: { ...typography.caption, color: colors.textDim, textAlign: 'center' },
  votedValue: { ...typography.heading, color: colors.danger, textAlign: 'center', letterSpacing: 2 },
  votedKeep: { color: colors.success },
  votedWait: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
