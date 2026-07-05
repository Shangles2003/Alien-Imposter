import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Avatar, Button } from '@/components/ui';
import { formatChamberAnswer } from '@/components/game/chamberFormat';
import { DrawingPreview } from '@/components/game/DrawingPreview';
import { ActiveTaskFrame } from '@/components/game/CrewExperience';
import { GLYPH_SYMBOLS, getPromptForPlayer } from '@/game/prompts';
import { AgreementLevel, GamePlayer, GameState } from '@/types/game';
import { colors, gradients, radius, spacing, typography } from '@/theme';
import { WritingPodInput } from '@/components/game/WritingPodInput';
import { DrawingPad } from './DrawingPad';

const AGREEMENT: {
  value: AgreementLevel;
  label: string;
  sub: string;
  color: string;
}[] = [
  { value: 'strongly_disagree', label: 'Strong no', sub: 'Disagree', color: '#f43f5e' },
  { value: 'slightly_disagree', label: 'No', sub: 'Lean no', color: '#fb923c' },
  { value: 'slightly_agree', label: 'Yes', sub: 'Lean yes', color: '#4ade80' },
  { value: 'strongly_agree', label: 'Strong yes', sub: 'Agree', color: '#10b981' },
];

interface ChamberInputProps {
  game: GameState;
  player: GamePlayer;
  onSubmit: (value: string, extra?: Partial<{ drawingPaths: string; selectedPlayerId: string; selectedGlyphs: number[] }>) => void;
  submitted: boolean;
}

export function ChamberInput({ game, player, onSubmit, submitted }: ChamberInputProps) {
  const chamber = game.selectedChamber!;
  const prompt = game.activePrompt!;
  const promptText = getPromptForPlayer(prompt, player.role, player.isHacked);
  const [selectedPlayer, setSelectedPlayer] = React.useState<string | null>(null);
  const [selectedGlyphs, setSelectedGlyphs] = React.useState<number[]>([]);
  const [drawing, setDrawing] = React.useState('');

  if (submitted) return null;

  if (chamber === 'opinion_hold') {
    return (
      <ActiveTaskFrame game={game} prompt={promptText}>
        <View style={styles.opinionRow}>
          {AGREEMENT.map((opt, i) => (
            <Animated.View
              key={opt.value}
              entering={FadeInUp.delay(60 * i).duration(300)}
              style={styles.opinionItem}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.opinionBtn,
                  { borderColor: opt.color, backgroundColor: `${opt.color}14` },
                  pressed && { backgroundColor: `${opt.color}30`, transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => onSubmit(opt.value, {})}
              >
                <Text style={[styles.opinionMain, { color: opt.color }]}>{opt.label}</Text>
                <Text style={styles.opinionSub}>{opt.sub}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ActiveTaskFrame>
    );
  }

  if (chamber === 'deliberation_deck') {
    const options = prompt.options ?? [];

    return (
      <ActiveTaskFrame game={game} prompt={promptText}>
        <View style={styles.choiceCol}>
          {options.map((opt, i) => (
            <Animated.View key={opt} entering={FadeInUp.delay(70 * i).duration(300)}>
              <Pressable
                style={({ pressed }) => [styles.choiceBtn, pressed && styles.choiceBtnPressed]}
                onPress={() => onSubmit(opt, {})}
              >
                <View style={styles.choiceNumWrap}>
                  <Text style={styles.choiceNum}>{String.fromCharCode(65 + i)}</Text>
                </View>
                <Text style={styles.choiceText}>{opt}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ActiveTaskFrame>
    );
  }

  if (chamber === 'writing_pod') {
    return (
      <WritingPodInput
        game={game}
        prompt={promptText}
        onSubmit={(value) => onSubmit(value, {})}
      />
    );
  }

  if (chamber === 'drawing_quarters') {
    return (
      <ActiveTaskFrame
        game={game}
        prompt={promptText}
        layout="canvas"
        footer={
          <Button
            title="Submit drawing"
            fullWidth
            size="md"
            disabled={!drawing}
            onPress={() => onSubmit('drawing', { drawingPaths: drawing })}
          />
        }
      >
        <DrawingPad expand onChange={setDrawing} />
      </ActiveTaskFrame>
    );
  }

  if (chamber === 'most_likely_to') {
    const candidates = game.players.filter((p) => p.isAlive);
    return (
      <ActiveTaskFrame
        game={game}
        prompt={promptText}
        footer={
          <Button
            title={selectedPlayer ? 'Lock in vote' : 'Pick someone first'}
            fullWidth
            size="md"
            disabled={!selectedPlayer}
            onPress={() => onSubmit(selectedPlayer!, { selectedPlayerId: selectedPlayer! })}
          />
        }
      >
        <View style={styles.voteGrid}>
          {candidates.map((c, i) => {
            const picked = selectedPlayer === c.uid;
            return (
              <Animated.View key={c.uid} entering={FadeInUp.delay(40 * i).duration(280)}>
                <Pressable
                  style={[styles.voteCard, picked && styles.voteCardOn]}
                  onPress={() => setSelectedPlayer(c.uid)}
                >
                  <Avatar name={c.displayName} color={c.avatarColor} size={44} ring={picked} />
                  <Text
                    style={[styles.voteName, picked && styles.voteNameOn]}
                    numberOfLines={1}
                  >
                    {c.displayName.split(' ').pop()}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ActiveTaskFrame>
    );
  }

  if (chamber === 'bioscanner') {
    const isCaptain = game.captainId === player.uid;
    const isOperator = game.bioscanner.operatorIds.includes(player.uid);

    if (isCaptain) {
      return (
        <ActiveTaskFrame game={game} prompt="Read these symbols aloud to your operators">
          <LinearGradient colors={[...gradients.timer]} style={styles.glyphPanel}>
            {game.bioscanner.captainGlyphs.map((g) => (
              <Text key={g} style={styles.glyph}>{GLYPH_SYMBOLS[g]}</Text>
            ))}
          </LinearGradient>
        </ActiveTaskFrame>
      );
    }

    if (isOperator) {
      const toggle = (g: number) =>
        setSelectedGlyphs((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

      return (
        <ActiveTaskFrame
          game={game}
          prompt="Tap symbols that match the captain"
          footer={
            <Button
              title={`Confirm match (${selectedGlyphs.length}/${game.bioscanner.captainGlyphs.length})`}
              fullWidth
              size="md"
              disabled={selectedGlyphs.length !== game.bioscanner.captainGlyphs.length}
              onPress={() => onSubmit('glyphs', { selectedGlyphs })}
            />
          }
        >
          <View style={styles.glyphGrid}>
            {game.bioscanner.glyphSet.map((g) => (
              <Pressable
                key={g}
                style={({ pressed }) => [
                  styles.glyphBtn,
                  selectedGlyphs.includes(g) && styles.glyphBtnOn,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
                onPress={() => toggle(g)}
              >
                <Text style={styles.glyph}>{GLYPH_SYMBOLS[g]}</Text>
              </Pressable>
            ))}
          </View>
        </ActiveTaskFrame>
      );
    }

    return (
      <ActiveTaskFrame game={game} prompt="Operators are syncing">
        <Text style={styles.hint}>Stand by</Text>
      </ActiveTaskFrame>
    );
  }

  return null;
}

export function ChamberResults({ game }: { game: GameState }) {
  const lastRound = game.history[game.history.length - 1];
  if (!lastRound) return null;

  const isDrawing = lastRound.chamber === 'drawing_quarters';

  return (
    <View style={styles.results}>
      <Text style={styles.resultsTitle}>
        {isDrawing ? 'Compare drawings' : 'Compare answers'}
      </Text>
      <View style={[styles.resultsGrid, isDrawing && styles.resultsGridDraw]}>
        {lastRound.responses.map((r) => (
          <View key={r.playerId} style={[styles.resultCard, isDrawing && styles.resultCardDraw]}>
            <Text style={styles.resultName} numberOfLines={1}>
              {r.displayName}
            </Text>
            {r.drawingPaths ? (
              <DrawingPreview paths={r.drawingPaths} height={isDrawing ? 64 : 48} />
            ) : (
              <View style={styles.answerPill}>
                <Text style={styles.answerText} numberOfLines={3}>
                  {formatChamberAnswer(r, game)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  opinionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    height: 76,
  },
  opinionItem: { flex: 1 },
  opinionBtn: {
    flex: 1,
    height: 76,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  opinionMain: { ...typography.caption, fontWeight: '800', textAlign: 'center', fontSize: 11 },
  opinionSub: { ...typography.small, color: colors.textDim, fontSize: 9, marginTop: 2, textAlign: 'center' },
  choiceCol: { gap: spacing.sm },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceBtnPressed: { borderColor: colors.accent, backgroundColor: colors.glowCyan },
  choiceNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceNum: { color: colors.accentSoft, fontWeight: '800', fontSize: 13 },
  choiceText: { ...typography.caption, color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
  voteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  voteCard: {
    width: 100,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
  },
  voteCardOn: { borderColor: colors.accent, backgroundColor: colors.glowCyan },
  voteName: { ...typography.caption, color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  voteNameOn: { color: colors.text, fontWeight: '800' },
  glyphPanel: {
    height: 88,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.md,
  },
  glyph: { fontSize: 34, color: '#fff' },
  glyphGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  glyphBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
  },
  glyphBtnOn: { borderColor: colors.accent, backgroundColor: colors.glowCyan },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  results: { flex: 1, gap: spacing.xs, minHeight: 0 },
  resultsTitle: { ...typography.caption, color: colors.textDim, fontWeight: '700' },
  resultsGrid: { flex: 1, gap: spacing.xs, minHeight: 0 },
  resultsGridDraw: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignContent: 'flex-start',
  },
  resultCard: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  resultCardDraw: {
    flex: 0,
    width: '48%',
    minHeight: 96,
  },
  resultName: { ...typography.caption, color: colors.text, fontWeight: '800', fontSize: 13 },
  answerPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
  },
  answerText: { ...typography.caption, color: colors.accentSoft, fontSize: 13, lineHeight: 18 },
});
