import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SectionLabel } from '@/components/ui';
import { getPackListing } from '@/content/catalog';
import {
  ContentPackId,
  FREE_MISSION_COUNT,
  HostSettings,
  MissionCount,
} from '@/content/types';
import { colors, radius, spacing, typography } from '@/theme';

const MISSION_OPTIONS: MissionCount[] = [3, 5, 7];
const CUSTOM_ONLY_MIN = 7;
const BETRAYAL = getPackListing('betrayal');

interface HostSettingsPanelProps {
  settings: HostSettings;
  onChange: (settings: HostSettings) => void;
  disabled?: boolean;
  /** Host's entitlement — free hosts are pinned to 5 stages / core only. */
  hasPremium?: boolean;
  /** How many custom prompts the host has (for the custom-only guard). */
  customCount?: number;
  /** Called when a free host taps a premium-only option. */
  onRequestUpgrade?: () => void;
  /** Open the custom deck builder. */
  onEditCustomDeck?: () => void;
}

interface SourceRowProps {
  emoji: string;
  name: string;
  tagline: string;
  on: boolean;
  hasPremium: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onRequestUpgrade?: () => void;
}

function SourceRow({
  emoji,
  name,
  tagline,
  on,
  hasPremium,
  disabled,
  onToggle,
  onRequestUpgrade,
}: SourceRowProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.packRow}>
      <Text style={styles.packEmoji}>{emoji}</Text>
      <View style={styles.packCopy}>
        <Text style={styles.packName}>
          {name}
          {!hasPremium ? ' 🔒' : ''}
        </Text>
        <Text style={styles.packTagline} numberOfLines={2}>
          {tagline}
        </Text>
      </View>
      {hasPremium ? (
        <Switch
          value={on}
          disabled={disabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      ) : (
        <Pressable onPress={onRequestUpgrade} disabled={disabled} hitSlop={8}>
          <Text style={styles.unlockLink}>{t('hostSettings.unlock')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function HostSettingsPanel({
  settings,
  onChange,
  disabled,
  hasPremium = false,
  customCount = 0,
  onRequestUpgrade,
  onEditCustomDeck,
}: HostSettingsPanelProps) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const commit = (next: HostSettings) => {
    setLocal(next);
    onChange(next);
  };

  const coreOn = local.contentPacks.includes('core');
  const betrayalOn = local.contentPacks.includes('betrayal');
  const customOn = local.useCustomDeck;

  const setMissionCount = (count: MissionCount) => {
    if (!hasPremium && count !== FREE_MISSION_COUNT) {
      onRequestUpgrade?.();
      return;
    }
    commit({ ...local, missionCount: count });
  };

  // Validate a proposed set of sources; returns an error string or null.
  const sourcesError = (core: boolean, betrayal: boolean, custom: boolean): string | null => {
    const anyPack = core || betrayal;
    if (!anyPack && !custom) return t('hostSettings.keepOneSource');
    if (!anyPack && custom && customCount < CUSTOM_ONLY_MIN) {
      return t('hostSettings.customOnlyMin', { min: CUSTOM_ONLY_MIN, count: customCount });
    }
    return null;
  };

  const applySources = (core: boolean, betrayal: boolean, custom: boolean) => {
    const err = sourcesError(core, betrayal, custom);
    if (err) {
      Alert.alert(t('hostSettings.headsUp'), err);
      return;
    }
    const contentPacks: ContentPackId[] = [];
    if (core) contentPacks.push('core');
    if (betrayal) contentPacks.push('betrayal');
    commit({ ...local, contentPacks, useCustomDeck: custom });
  };

  const guardPremium = (fn: () => void) => () => {
    if (!hasPremium) {
      onRequestUpgrade?.();
      return;
    }
    fn();
  };

  return (
    <View style={styles.wrap}>
      <SectionLabel>{t('hostSettings.title')}</SectionLabel>

      <Text style={styles.fieldLabel}>{t('hostSettings.missionLength')}</Text>
      <View style={styles.segmentRow}>
        {MISSION_OPTIONS.map((count) => {
          const active = local.missionCount === count;
          const locked = !hasPremium && count !== FREE_MISSION_COUNT;
          return (
            <Pressable
              key={count}
              disabled={disabled}
              onPress={() => setMissionCount(count)}
              style={[
                styles.segment,
                active && styles.segmentActive,
                locked && styles.segmentLocked,
                disabled && styles.segmentDisabled,
              ]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {locked ? `🔒 ${count}` : count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.fieldLabel, styles.packHeading]}>{t('hostSettings.promptSources')}</Text>

      {hasPremium ? (
        <>
          <SourceRow
            emoji="🛸"
            name={t('hostSettings.basePrompts')}
            tagline={t('hostSettings.basePromptsTagline')}
            on={coreOn}
            hasPremium
            disabled={disabled}
            onToggle={() => applySources(!coreOn, betrayalOn, customOn)}
          />
          <SourceRow
            emoji={BETRAYAL.emoji}
            name={t('packs.betrayalName')}
            tagline={t('packs.betrayalTagline')}
            on={betrayalOn}
            hasPremium
            disabled={disabled}
            onToggle={() => applySources(coreOn, !betrayalOn, customOn)}
          />
          <View style={styles.packRow}>
            <Text style={styles.packEmoji}>🗂️</Text>
            <View style={styles.packCopy}>
              <Text style={styles.packName}>{t('hostSettings.myCustomDeck')}</Text>
              <Pressable onPress={onEditCustomDeck} hitSlop={6} disabled={disabled}>
                <Text style={styles.packTagline} numberOfLines={2}>
                  {t('hostSettings.yourOwnQuestions', { count: customCount })}
                  <Text style={styles.editLink}>{t('hostSettings.edit')}</Text>
                </Text>
              </Pressable>
            </View>
            <Switch
              value={customOn}
              disabled={disabled}
              onValueChange={() => applySources(coreOn, betrayalOn, !customOn)}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>
          <Text style={styles.hint}>{t('hostSettings.mixHint')}</Text>
        </>
      ) : (
        <>
          <SourceRow
            emoji={BETRAYAL.emoji}
            name={t('packs.betrayalName')}
            tagline={t('packs.betrayalTagline')}
            on={false}
            hasPremium={false}
            disabled={disabled}
            onToggle={guardPremium(() => {})}
            onRequestUpgrade={onRequestUpgrade}
          />
          <SourceRow
            emoji="🗂️"
            name={t('hostSettings.myCustomDeck')}
            tagline={t('hostSettings.customDeckFreeTagline')}
            on={false}
            hasPremium={false}
            disabled={disabled}
            onToggle={guardPremium(() => {})}
            onRequestUpgrade={onRequestUpgrade}
          />
          <Pressable onPress={onRequestUpgrade} disabled={disabled} hitSlop={6}>
            <Text style={styles.upgradeHint}>
              {t('hostSettings.upgradeHint')} <Text style={styles.upgradeLink}>{t('hostSettings.unlockArrow')}</Text>
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  packHeading: { marginTop: spacing.sm },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentActive: {
    borderColor: colors.accent,
    backgroundColor: colors.glowCyan,
  },
  segmentLocked: { opacity: 0.7, borderStyle: 'dashed' },
  segmentDisabled: { opacity: 0.5 },
  segmentText: { ...typography.body, color: colors.textMuted },
  segmentTextActive: { color: colors.accentSoft, fontWeight: '600' },
  packRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  packEmoji: { fontSize: 22 },
  packCopy: { flex: 1, minWidth: 0 },
  packName: { ...typography.body, color: colors.text, fontWeight: '700' },
  packTagline: { ...typography.small, color: colors.textDim, letterSpacing: 0, marginTop: 1 },
  unlockLink: { ...typography.small, color: colors.accentSoft, fontWeight: '800' },
  editLink: { color: colors.accentSoft, fontWeight: '800' },
  hint: { ...typography.small, color: colors.textDim, lineHeight: 17 },
  upgradeHint: { ...typography.small, color: colors.textMuted, lineHeight: 18 },
  upgradeLink: { color: colors.accentSoft, fontWeight: '700' },
});
