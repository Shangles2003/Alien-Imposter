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
import { useTranslation } from 'react-i18next';
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

/** Text (labels/placeholders/hints) resolves from the `deck.types.<chamber>` namespace. */
const TYPES: { chamber: ChamberType; icon: string; deliberation?: boolean }[] = [
  { chamber: 'most_likely_to', icon: '👆' },
  { chamber: 'writing_pod', icon: '✍️' },
  { chamber: 'opinion_hold', icon: '⚖️' },
  { chamber: 'drawing_quarters', icon: '🎨' },
  { chamber: 'deliberation_deck', icon: '🎲', deliberation: true },
];

export function DeckBuilder() {
  const router = useRouter();
  const { t } = useTranslation();
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
      Alert.alert(t('deck.couldNotSave'), e instanceof Error ? e.message : t('deck.somethingWrong'));
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
          <Text style={styles.lockedTitle}>{t('deck.premiumTitle')}</Text>
          <Text style={styles.lockedBody}>{t('deck.premiumBody')}</Text>
          <Button title={t('deck.unlockExpansion')} fullWidth onPress={() => router.push('/paywall' as Href)} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll contentStyle={styles.shell}>
      <ScreenTopBar onBack={() => router.back()} />
      <ScreenHeader
        title={t('deck.title')}
        subtitle={t('deck.subtitle')}
        icon="🗂️"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeRow}
      >
        {TYPES.map((type) => {
          const active = type.chamber === selected;
          const count = prompts.filter((p) => p.chamber === type.chamber).length;
          return (
            <PressableScale
              key={type.chamber}
              scaleTo={0.95}
              onPress={() => {
                setSelected(type.chamber);
                resetForm();
              }}
              style={[styles.typeChip, active && styles.typeChipActive]}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                {t(`deck.types.${type.chamber}.label`)}
              </Text>
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
            label={t(`deck.types.${meta.chamber}.crewLabel`)}
            value={crew}
            onChangeText={setCrew}
            placeholder={t(`deck.types.${meta.chamber}.crewPlaceholder`)}
            autoCapitalize="sentences"
          />
          <Input
            label={t(`deck.types.${meta.chamber}.imposterLabel`)}
            value={imposter}
            onChangeText={setImposter}
            placeholder={t(`deck.types.${meta.chamber}.imposterPlaceholder`)}
            autoCapitalize="sentences"
          />
          {meta.deliberation ? (
            <View style={styles.optionsWrap}>
              <Text style={styles.optionsLabel}>{t('deck.answerOptions')}</Text>
              {options.map((opt, i) => (
                <Input
                  key={i}
                  label=""
                  value={opt}
                  onChangeText={(v) =>
                    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)))
                  }
                  placeholder={t('deck.option', { n: i + 1 })}
                  autoCapitalize="sentences"
                />
              ))}
            </View>
          ) : null}
          <Text style={styles.hint}>{t(`deck.types.${meta.chamber}.hint`)}</Text>
          <Button
            title={saving ? t('deck.saving') : t('deck.addToDeck')}
            fullWidth
            disabled={!valid || saving}
            onPress={handleAdd}
          />
        </View>
      </GlowCard>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {t('deck.listTitle', { label: t(`deck.types.${meta.chamber}.label`), count: forType.length })}
        </Text>
        <Text style={styles.listTotal}>{t('deck.total', { count: prompts.length })}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />
      ) : forType.length === 0 ? (
        <Text style={styles.empty}>{t('deck.empty')}</Text>
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
