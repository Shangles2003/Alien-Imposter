import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SectionLabel } from '@/components/ui';
import { PACK_LISTINGS } from '@/content/catalog';
import {
  ContentPackId,
  FREE_MISSION_COUNT,
  HostSettings,
  MissionCount,
} from '@/content/types';
import { colors, radius, spacing, typography } from '@/theme';

const MISSION_OPTIONS: MissionCount[] = [3, 5, 7];
const EXPANSION_PACKS = PACK_LISTINGS.filter((p) => p.purchasable);

interface HostSettingsPanelProps {
  settings: HostSettings;
  onChange: (settings: HostSettings) => void;
  disabled?: boolean;
  /** Host's entitlement — free hosts are pinned to 5 stages and can't add packs. */
  hasPremium?: boolean;
  /** Called when a free host taps a premium-only option. */
  onRequestUpgrade?: () => void;
}

/** Host settings — stage length + expansion packs, gated by the host's entitlement. */
export function HostSettingsPanel({
  settings,
  onChange,
  disabled,
  hasPremium = false,
  onRequestUpgrade,
}: HostSettingsPanelProps) {
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const commit = (next: HostSettings) => {
    setLocal(next);
    onChange(next);
  };

  const setMissionCount = (count: MissionCount) => {
    if (!hasPremium && count !== FREE_MISSION_COUNT) {
      onRequestUpgrade?.();
      return;
    }
    commit({ ...local, missionCount: count });
  };

  const togglePack = (id: ContentPackId) => {
    if (!hasPremium) {
      onRequestUpgrade?.();
      return;
    }
    const has = local.contentPacks.includes(id);
    const contentPacks = has
      ? local.contentPacks.filter((p) => p !== id)
      : [...local.contentPacks, id];
    commit({ ...local, contentPacks });
  };

  const toggleCustomDeck = () => {
    if (!hasPremium) {
      onRequestUpgrade?.();
      return;
    }
    commit({ ...local, useCustomDeck: !local.useCustomDeck });
  };

  return (
    <View style={styles.wrap}>
      <SectionLabel>Host Settings</SectionLabel>

      <Text style={styles.fieldLabel}>Mission length</Text>
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

      <Text style={[styles.fieldLabel, styles.packHeading]}>Expansion packs</Text>
      {EXPANSION_PACKS.map((pack) => {
        const on = hasPremium && local.contentPacks.includes(pack.id);
        return (
          <View key={pack.id} style={styles.packRow}>
            <Text style={styles.packEmoji}>{pack.emoji}</Text>
            <View style={styles.packCopy}>
              <Text style={styles.packName}>
                {pack.name}
                {!hasPremium ? ' 🔒' : ''}
              </Text>
              <Text style={styles.packTagline} numberOfLines={2}>
                {pack.tagline}
              </Text>
            </View>
            {hasPremium ? (
              <Switch
                value={on}
                disabled={disabled}
                onValueChange={() => togglePack(pack.id)}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            ) : (
              <Pressable onPress={onRequestUpgrade} disabled={disabled} hitSlop={8}>
                <Text style={styles.unlockLink}>Unlock</Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <View style={styles.packRow}>
        <Text style={styles.packEmoji}>🗂️</Text>
        <View style={styles.packCopy}>
          <Text style={styles.packName}>
            My Custom Deck
            {!hasPremium ? ' 🔒' : ''}
          </Text>
          <Text style={styles.packTagline} numberOfLines={2}>
            Mix in your own questions (build it from the menu).
          </Text>
        </View>
        {hasPremium ? (
          <Switch
            value={local.useCustomDeck}
            disabled={disabled}
            onValueChange={toggleCustomDeck}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        ) : (
          <Pressable onPress={onRequestUpgrade} disabled={disabled} hitSlop={8}>
            <Text style={styles.unlockLink}>Unlock</Text>
          </Pressable>
        )}
      </View>

      {hasPremium ? (
        <Text style={styles.hint}>
          Longer games give the crew more evidence. Expansion packs mix their prompts into your
          games.
        </Text>
      ) : (
        <Pressable onPress={onRequestUpgrade} disabled={disabled} hitSlop={6}>
          <Text style={styles.upgradeHint}>
            The Expansion Pass unlocks 3 &amp; 7-stage games, every base prompt, and the Betrayal
            Pack for your whole table. <Text style={styles.upgradeLink}>Unlock →</Text>
          </Text>
        </Pressable>
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
  hint: { ...typography.small, color: colors.textDim },
  upgradeHint: { ...typography.small, color: colors.textMuted, lineHeight: 18 },
  upgradeLink: { color: colors.accentSoft, fontWeight: '700' },
});
