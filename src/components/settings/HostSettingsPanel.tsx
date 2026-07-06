import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SectionLabel } from '@/components/ui';
import { HostSettings, MissionCount } from '@/content/types';
import { colors, radius, spacing, typography } from '@/theme';

const MISSION_OPTIONS: MissionCount[] = [3, 5, 7];

interface HostSettingsPanelProps {
  settings: HostSettings;
  onChange: (settings: HostSettings) => void;
  disabled?: boolean;
}

/** Host settings — everything is free, every host can configure their game. */
export function HostSettingsPanel({ settings, onChange, disabled }: HostSettingsPanelProps) {
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const setMissionCount = (count: MissionCount) => {
    const next = { ...local, missionCount: count };
    setLocal(next);
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <SectionLabel>Host Settings</SectionLabel>

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
      <Text style={styles.hint}>Shorter games are faster; longer games give the crew more evidence.</Text>
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
  hint: { ...typography.small, color: colors.textDim },
});
