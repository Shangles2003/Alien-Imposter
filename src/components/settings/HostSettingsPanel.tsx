import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowCard, SectionLabel } from '@/components/ui';
import { PACK_LISTINGS } from '@/content/catalog';
import { ContentPackId, HostSettings, MissionCount } from '@/content/types';
import { usePremium } from '@/context/PremiumContext';
import { colors, radius, spacing, typography } from '@/theme';

const MISSION_OPTIONS: MissionCount[] = [3, 5, 7];

interface HostSettingsPanelProps {
  settings: HostSettings;
  onChange: (settings: HostSettings) => void;
  disabled?: boolean;
}

export function HostSettingsPanel({ settings, onChange, disabled }: HostSettingsPanelProps) {
  const { hasPremiumAccess, hasPack } = usePremium();
  const [local, setLocal] = useState(settings);
  const ownsAnyPremiumPack = PACK_LISTINGS.some((p) => !p.free && hasPack(p.id));
  const canConfigure = hasPremiumAccess || ownsAnyPremiumPack;

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  if (!canConfigure) {
    return (
      <GlowCard accent="cyan">
        <Text style={styles.lockedTitle}>Captain&apos;s Pass &amp; Packs</Text>
        <Text style={styles.lockedBody}>
          Subscribe for host settings, or buy the Spicy Pack for extra prompts. Core Crew stays free.
        </Text>
      </GlowCard>
    );
  }

  const togglePack = (packId: ContentPackId) => {
    if (packId === 'core') return;
    if (!hasPack(packId)) return;

    const has = local.contentPacks.includes(packId);
    const nextPacks = has
      ? local.contentPacks.filter((id) => id !== packId)
      : [...local.contentPacks, packId];

    const merged = nextPacks.includes('core') ? nextPacks : (['core', ...nextPacks] as ContentPackId[]);
    const next: HostSettings = { ...local, contentPacks: merged };
    setLocal(next);
    onChange(next);
  };

  const setMissionCount = (count: MissionCount) => {
    const next = { ...local, missionCount: count };
    setLocal(next);
    onChange(next);
  };

  const premiumPacks = PACK_LISTINGS.filter((p) => !p.free);

  return (
    <View style={styles.wrap}>
      <SectionLabel>Host Settings</SectionLabel>

      {hasPremiumAccess ? (
        <>
          <Text style={styles.fieldLabel}>Mission length</Text>
          <View style={styles.segmentRow}>
            {MISSION_OPTIONS.map((count) => {
              const active = local.missionCount === count;
              return (
                <Pressable
                  key={count}
                  disabled={disabled}
                  onPress={() => setMissionCount(count)}
                  style={[styles.segment, active && styles.segmentActive, disabled && styles.segmentDisabled]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{count}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <Text style={styles.lockedHint}>Mission length requires Captain&apos;s Pass (5 missions on free host).</Text>
      )}

      <Text style={styles.fieldLabel}>Question packs</Text>
      {premiumPacks.map((pack) => {
        const owned = hasPack(pack.id);
        const enabled = local.contentPacks.includes(pack.id);
        return (
          <Pressable
            key={pack.id}
            disabled={disabled || !owned}
            onPress={() => togglePack(pack.id)}
            style={[styles.packRow, !owned && styles.packRowLocked, disabled && styles.segmentDisabled]}
          >
            <Text style={styles.packEmoji}>{pack.emoji}</Text>
            <View style={styles.packCopy}>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packTagline} numberOfLines={2}>
                {owned ? pack.tagline : 'Purchase to enable in your lobbies.'}
              </Text>
            </View>
            <View style={[styles.toggle, enabled && owned && styles.toggleOn, !owned && styles.toggleLocked]}>
              <Text style={styles.toggleLabel}>{!owned ? '🔒' : enabled ? 'ON' : 'OFF'}</Text>
            </View>
          </Pressable>
        );
      })}
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
  segmentDisabled: { opacity: 0.5 },
  segmentText: { ...typography.body, color: colors.textMuted },
  segmentTextActive: { color: colors.accentSoft, fontWeight: '600' },
  packRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  packRowLocked: { opacity: 0.7 },
  packEmoji: { fontSize: 22 },
  packCopy: { flex: 1, gap: 2 },
  packName: { ...typography.body, color: colors.text, fontWeight: '600' },
  packTagline: { ...typography.small, color: colors.textDim },
  toggle: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSolid,
    alignItems: 'center',
  },
  toggleOn: { backgroundColor: colors.glowCyan, borderWidth: 1, borderColor: colors.accent },
  toggleLocked: { opacity: 0.6 },
  toggleLabel: { ...typography.small, color: colors.text, fontWeight: '700' },
  lockedTitle: {
    ...typography.body,
    color: colors.accentSoft,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  lockedBody: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  lockedHint: {
    ...typography.small,
    color: colors.textDim,
    marginBottom: spacing.xs,
  },
});
