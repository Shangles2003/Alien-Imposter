import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  Button,
  GlowCard,
  Input,
  PressableScale,
  ScreenHeader,
  ScreenShell,
  ScreenTopBar,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePremium } from '@/context/PremiumContext';
import {
  addCustomPrompt,
  deleteCustomPrompt,
  fetchMyCustomPrompts,
} from '@/services/customDecks';
import { ChamberType, CustomPrompt } from '@/types/game';
import { colors, radius, spacing, typography } from '@/theme';

interface TypeMeta {
  chamber: ChamberType;
  label: string;
  icon: string;
  crewLabel: string;
  crewPlaceholder: string;
  imposterLabel: string;
  imposterPlaceholder: string;
  hint: string;
  deliberation?: boolean;
}

const TYPES: TypeMeta[] = [
  {
    chamber: 'most_likely_to',
    label: 'Most Likely',
    icon: '👆',
    crewLabel: 'Crew question',
    crewPlaceholder: 'Who is most likely to no-show your birthday?',
    imposterLabel: 'Imposter question',
    imposterPlaceholder: 'Who is most likely to forget what day it is?',
    hint: 'Two similar “who is most likely…” questions. The imposter’s should be answerable the same way — the tell builds over rounds.',
  },
  {
    chamber: 'writing_pod',
    label: 'Fill Blank',
    icon: '✍️',
    crewLabel: 'Crew fill-in-the-blank',
    crewPlaceholder: 'A true friend would never ___.',
    imposterLabel: 'Imposter fill-in-the-blank',
    imposterPlaceholder: 'A good roommate would never ___.',
    hint: 'Same sentence shape, swapped context. Keep the ___ blank in both.',
  },
  {
    chamber: 'opinion_hold',
    label: 'Opinion',
    icon: '⚖️',
    crewLabel: 'Crew statement',
    crewPlaceholder: 'Leaving a friend on read all day is totally fine.',
    imposterLabel: 'Imposter statement',
    imposterPlaceholder: 'You never owe anyone a fast reply.',
    hint: 'Two agree/disagree statements on the same topic. Both should be defensible out loud.',
  },
  {
    chamber: 'drawing_quarters',
    label: 'Drawing',
    icon: '🎨',
    crewLabel: 'Crew draws',
    crewPlaceholder: 'Draw the best gift you’ve ever gotten.',
    imposterLabel: 'Imposter draws',
    imposterPlaceholder: 'Draw something you’d love to get.',
    hint: 'Two prompts whose drawings look similar, so a single round never exposes the imposter.',
  },
  {
    chamber: 'deliberation_deck',
    label: 'Scenario',
    icon: '🎲',
    crewLabel: 'Scenario (crew sees the detail)',
    crewPlaceholder: 'A friend asks you to cover for them with a big lie.',
    imposterLabel: 'Imposter version (detail removed)',
    imposterPlaceholder: 'A friend asks you for a favor you’re unsure about.',
    hint: 'Crew see the specific scenario; the imposter sees a vaguer version. Add 2–3 shared answer options.',
    deliberation: true,
  },
];

export function DeckBuilder() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPremiumAccess } = usePremium();

  const [selected, setSelected] = useState<ChamberType>('most_likely_to');
  const [crew, setCrew] = useState('');
  const [imposter, setImposter] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const meta = useMemo(() => TYPES.find((t) => t.chamber === selected)!, [selected]);
  const forType = prompts.filter((p) => p.chamber === selected);

  useEffect(() => {
    if (!hasPremiumAccess || !user) {
      setLoading(false);
      return;
    }
    fetchMyCustomPrompts()
      .then(setPrompts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hasPremiumAccess, user]);

  const resetForm = () => {
    setCrew('');
    setImposter('');
    setOptions(['', '', '']);
  };

  const filledOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
  const valid =
    crew.trim().length > 0 &&
    imposter.trim().length > 0 &&
    (!meta.deliberation || filledOptions.length >= 2);

  const handleAdd = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const created = await addCustomPrompt({
        chamber: selected,
        humanPrompt: crew.trim(),
        alienPrompt: imposter.trim(),
        scenario: meta.deliberation ? crew.trim() : undefined,
        options: meta.deliberation ? filledOptions : undefined,
      });
      setPrompts((prev) => [created, ...prev]);
      resetForm();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    deleteCustomPrompt(id).catch(() => {
      // put it back if the delete failed
      fetchMyCustomPrompts().then(setPrompts).catch(() => {});
    });
  };

  if (!hasPremiumAccess) {
    return (
      <ScreenShell contentStyle={styles.shell}>
        <ScreenTopBar onBack={() => router.back()} />
        <View style={styles.locked}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>Custom decks are a premium feature</Text>
          <Text style={styles.lockedBody}>
            The Expansion Pass lets you write your own prompts and mix them into every game you host.
          </Text>
          <Button title="Unlock the Expansion" fullWidth onPress={() => router.push('/paywall' as Href)} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll contentStyle={styles.shell}>
      <ScreenTopBar onBack={() => router.back()} />
      <ScreenHeader
        title="Custom Deck"
        subtitle="Your own questions, mixed into games you host. Toggle it on in the lobby’s Host Settings."
        icon="🗂️"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeRow}
      >
        {TYPES.map((t) => {
          const active = t.chamber === selected;
          const count = prompts.filter((p) => p.chamber === t.chamber).length;
          return (
            <PressableScale
              key={t.chamber}
              scaleTo={0.95}
              onPress={() => {
                setSelected(t.chamber);
                resetForm();
              }}
              style={[styles.typeChip, active && styles.typeChipActive]}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{t.label}</Text>
              {count > 0 ? (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{count}</Text>
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </ScrollView>

      <GlowCard accent="cyan">
        <View style={styles.form}>
          <Input
            label={meta.crewLabel}
            value={crew}
            onChangeText={setCrew}
            placeholder={meta.crewPlaceholder}
            autoCapitalize="sentences"
          />
          <Input
            label={meta.imposterLabel}
            value={imposter}
            onChangeText={setImposter}
            placeholder={meta.imposterPlaceholder}
            autoCapitalize="sentences"
          />
          {meta.deliberation ? (
            <View style={styles.optionsWrap}>
              <Text style={styles.optionsLabel}>Answer options (add 2–3)</Text>
              {options.map((opt, i) => (
                <Input
                  key={i}
                  label=""
                  value={opt}
                  onChangeText={(v) =>
                    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)))
                  }
                  placeholder={`Option ${i + 1}`}
                  autoCapitalize="sentences"
                />
              ))}
            </View>
          ) : null}
          <Text style={styles.hint}>{meta.hint}</Text>
          <Button
            title={saving ? 'Saving…' : 'Add to deck'}
            fullWidth
            disabled={!valid || saving}
            onPress={handleAdd}
          />
        </View>
      </GlowCard>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {meta.label} · {forType.length}
        </Text>
        <Text style={styles.listTotal}>{prompts.length} total</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />
      ) : forType.length === 0 ? (
        <Text style={styles.empty}>No {meta.label.toLowerCase()} prompts yet — add your first above.</Text>
      ) : (
        forType.map((p) => (
          <View key={p.id} style={styles.promptRow}>
            <View style={styles.promptCopy}>
              <Text style={styles.promptCrew} numberOfLines={3}>
                {p.humanPrompt}
              </Text>
              <Text style={styles.promptImposter} numberOfLines={3}>
                👤 {p.alienPrompt}
              </Text>
              {p.options?.length ? (
                <Text style={styles.promptOptions} numberOfLines={2}>
                  {p.options.join('  ·  ')}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={() => handleDelete(p.id)} hitSlop={10} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>✕</Text>
            </Pressable>
          </View>
        ))
      )}
      <View style={{ height: spacing.xl }} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  lockedIcon: { fontSize: 44 },
  lockedTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  lockedBody: { ...typography.caption, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  typeRow: { gap: spacing.sm, paddingVertical: spacing.sm, paddingRight: spacing.md },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: { borderColor: colors.accent, backgroundColor: colors.glowCyan },
  typeIcon: { fontSize: 15 },
  typeLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  typeLabelActive: { color: colors.accentSoft },
  typeBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: { color: '#04050d', fontWeight: '900', fontSize: 10 },
  form: { gap: spacing.md },
  optionsWrap: { gap: spacing.sm },
  optionsLabel: { ...typography.label, color: colors.textMuted },
  hint: { ...typography.small, color: colors.textDim, lineHeight: 17 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  listTitle: { ...typography.heading, color: colors.text },
  listTotal: { ...typography.small, color: colors.textDim },
  empty: { ...typography.caption, color: colors.textDim, textAlign: 'center', marginTop: spacing.md },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
    marginBottom: spacing.sm,
  },
  promptCopy: { flex: 1, minWidth: 0, gap: 3 },
  promptCrew: { ...typography.body, color: colors.text, fontWeight: '600' },
  promptImposter: { ...typography.caption, color: colors.textMuted },
  promptOptions: { ...typography.small, color: colors.textDim, marginTop: 2 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  deleteText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
});
